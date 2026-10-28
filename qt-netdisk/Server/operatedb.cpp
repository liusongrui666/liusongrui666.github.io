#include <QtGlobal>
#include "operatedb.h"
#include<QDebug>
#include<QSqlError>
#include <QSqlQuery>
#include <string.h>
OperateDB &OperateDB::getInstance()
{
    static OperateDB instance;
    return instance;
}

void OperateDB::connectSQL()
{
    m_db.setHostName(qEnvironmentVariable("QT_DB_HOST", "localhost"));//设置主机名
    m_db.setPort(qEnvironmentVariable("QT_DB_PORT", "3306").toInt());//设置端口
    m_db.setUserName(qEnvironmentVariable("QT_DB_USER", "app_user"));//设置用户名
    m_db.setPassword(qEnvironmentVariable("QT_DB_PASSWORD"));//设置密码
    m_db.setDatabaseName(qEnvironmentVariable("QT_DB_NAME", "dp"));//设置数据库名
    if(m_db.open()){//进行判断
        qDebug()<<"数据库连接成功";
    }
    else{
        qDebug()<<"数据库连接失败"<<m_db.lastError().text();//调用函数输出错误
    }
}

OperateDB::~OperateDB()
{
    m_db.close();//关闭数据库
}

bool OperateDB::findAuthRecord(const QString& name, AuthRecord& out)
{
    // 每次查询前先重置输出参数。
    // 如果查询失败或用户不存在，调用方不会误用上一次的旧数据。
    out = AuthRecord();

    // QSqlQuery 是 Qt 的 SQL 查询对象。
    // 构造时传入 m_db，表示使用 OperateDB 持有的数据库连接。
    QSqlQuery query(m_db);

    // prepare 先固定 SQL 结构，:name 是命名占位符。
    //
    // 只按用户名查，不在 SQL 里比较密码：
    // 1. 避免 SQL 注入；
    // 2. 当前 MySQL 排序规则是 utf8mb4_general_ci，
    //    字符串比较大小写不敏感，还可能忽略尾随空格；
    // 3. 密码不应该出现在 SQL 文本里。
    //
    // 注意每段字符串末尾的空格：
    // C++ 会把相邻字符串自动拼接，缺少空格会变成
    // password_hashfrom、user_infowhere 这类非法 SQL。
    query.prepare(
        "SELECT id, name, password_hash "
        "FROM user_info "
        "WHERE name = :name "
        "LIMIT 1");

    // bindValue 把 name 作为“值”绑定到 :name。
    // 用户名里的单引号、-- 等字符只会被当成普通数据，
    // 不会改变 SQL 语法结构。
    query.bindValue(":name", name);

    // exec 执行查询。
    // 返回 false 表示 SQL 执行失败，也就是数据库错误。
    if (!query.exec()) {
        // lastError 返回 QSqlError，包含错误码和错误文本。
        // nativeErrorCode 是数据库原生错误码，
        // text 是可读的错误描述。
        // 这里只写日志，不把 SQL 错误原文返回给客户端。
        qWarning() << "findAuthRecord failed:"
                   << query.lastError().nativeErrorCode()
                   << query.lastError().text();
        return false;
    }

    // next 尝试移动到结果集第一行。
    // 返回 false 说明查询成功，但没有这个用户。
    // 这和数据库错误不是一回事，所以仍然返回 true。
    if (!query.next()) {
        return true;
    }

    // value(0) 取第 1 列 id，toLongLong 转成 qint64。
    // value(1) 取第 2 列 name，toString 转成 QString。
    // value(2) 取第 3 列 password_hash，toByteArray 转成 QByteArray。
    out.id = query.value(0).toLongLong();
    out.name = query.value(1).toString();
    out.passwordHash = query.value(2).toByteArray();
    out.found = true;
    return true;
}

bool OperateDB::insertUser(const QString& name,
                           const QByteArray& passwordHash,
                           qint64& newId,
                           bool& duplicate)
{
    // 先给输出参数默认值。
    // 插入失败时，调用方不会误用上一次的 id 或 duplicate。
    newId = -1;
    duplicate = false;

    // QSqlQuery 是 Qt 的 SQL 查询对象。
    // 构造时传入 m_db，表示使用 OperateDB 持有的数据库连接。
    QSqlQuery query(m_db);

    // prepare 先固定 SQL 结构，:name 和 :hash 是命名占位符。
    // SQL 先被解析，用户数据随后作为“值”绑定，
    // 因此用户名里的单引号、-- 不会改变 SQL 语法。
    //
    // 每段字符串末尾保留空格，避免
    // "password_hash)" "VALUES" 拼成 password_hash)VALUES。
    query.prepare(
        "INSERT INTO user_info(name, password_hash) "
        "VALUES(:name, :hash)");

    // bindValue 把 QString 类型的用户名绑定到 :name。
    query.bindValue(":name", name);

    // 绑定 Argon2id 哈希字符串。
    //
    // QString::fromLatin1 把 QByteArray 里的 ASCII 字节
    // 转成 QString；当前 password_hash 列是 VARCHAR，
    // 用 QString 绑定更贴合列类型。
    // constData 返回字节首地址，size 返回字节数。
    query.bindValue(
        ":hash",
        QString::fromLatin1(passwordHash.constData(),
                            passwordHash.size()));

    // exec 执行 INSERT。
    // 返回 false 表示插入失败。
    if (!query.exec()) {
        // lastError 返回 QSqlError。
        // nativeErrorCode 返回数据库原生错误码。
        //
        // MySQL 1062 = Duplicate entry，表示用户名已存在。
        // 并发注册时，唯一索引会让其中一个 INSERT 成功，
        // 另一个在这里失败。
        //
        // nativeErrorCode 返回 QString，
        // 所以和字符串 "1062" 比较，不是整数 1062。
        if (query.lastError().nativeErrorCode() == "1062") {
            duplicate = true;
        } else {
            qWarning() << "insertUser failed:"
                       << query.lastError().nativeErrorCode()
                       << query.lastError().text();
        }
        return false;
    }

    // lastInsertId 返回本次 INSERT 生成的自增主键，
    // 类型是 QVariant；toLongLong 转成 qint64。
    // 注册目录创建失败时要用这个 id 做补偿删除。
    newId = query.lastInsertId().toLongLong();
    return true;
}

bool OperateDB::deleteUser(qint64 id)
{
    // QSqlQuery 使用 OperateDB 的数据库连接 m_db。
    QSqlQuery query(m_db);

    // prepare 固定 DELETE 结构，:id 是命名占位符。
    // 按主键删除，只删刚插入的那条用户记录。
    // 不使用用户名作为条件，避免大小写、空格、重名导致误删。
    query.prepare("DELETE FROM user_info WHERE id = :id");

    // bindValue 把 qint64 类型的 id 绑定到 :id。
    query.bindValue(":id", id);

    // exec 执行 DELETE。
    if (!query.exec()) {
        // lastError 返回 QSqlError；
        // nativeErrorCode 是数据库原生错误码，
        // text 是可读错误文本。
        qWarning() << "deleteUser failed:"
                   << query.lastError().nativeErrorCode()
                   << query.lastError().text();
        return false;
    }

    // numRowsAffected 返回本次 DELETE 实际删掉的行数。
    // 等于 0 说明这个 id 不存在，或者已经被删过了。
    // 这不是 SQL 语法错误，但说明补偿没有命中，需要记录。
    if (query.numRowsAffected() == 0) {
        qWarning() << "deleteUser affected 0 rows, id =" << id;
    }

    return true;
}

bool OperateDB::setOnline(qint64 id, bool online)
{
    // QSqlQuery 使用 OperateDB 的数据库连接 m_db。
    QSqlQuery query(m_db);

    // prepare 固定 UPDATE 结构，:online 和 :id 是命名占位符。
    // 按主键 id 更新在线状态，
    // 不使用用户名作为条件，避免大小写、空格、重名导致更新错行。
    query.prepare(
        "UPDATE user_info SET online = :online WHERE id = :id");

    // 数据库里 online 是 tinyint，用 1/0 表示 true/false。
    // 三元运算符 online ? 1 : 0 把 bool 转成整数。
    query.bindValue(":online", online ? 1 : 0);

    // 绑定主键 id。
    query.bindValue(":id", id);

    // exec 执行 UPDATE。
    if (!query.exec()) {
        // lastError 返回 QSqlError；
        // nativeErrorCode 是数据库原生错误码，
        // text 是可读错误文本。
        qWarning() << "setOnline failed:"
                   << query.lastError().nativeErrorCode()
                   << query.lastError().text();
        return false;
    }

    // 注意：这里不检查 numRowsAffected() == 0。
    // 如果用户本来就在线，MySQL 可能返回 0 行受影响，
    // 但这不是错误。
    return true;
}

bool OperateDB::handleDelFriend(const char *caCurName, const char *caTarName)
{
    if(caCurName==NULL||caTarName==NULL){
        return false;
    }
    QString sql=QString(R"(
                        delete from friend where
                        (
                        user_id=(select id from user_info where name='%1')
                        and
                        friend_id=(select id from user_info where name='%2')
                        )
                        or
                        (
                        friend_id=(select id from user_info where name='%1')
                        and
                        user_id=(select id from user_info where name='%2')
                        )
                        )").arg(caCurName).arg(caTarName);
    QSqlQuery q;
    return q.exec(sql);
}

void OperateDB::handleOffline(const char *caName)
{
    if(caName==NULL){//对读取出来的信息进行判断
        return;//为空直接返回
    }
    QSqlQuery q;
    QString sql=QString("update user_info set online=0 where name='%1'").arg(caName);
    q.exec(sql);//返回执行的结果
    bool res=q.exec(sql);
    qDebug()<<"用户下线数据库处理"<<res;
}

int OperateDB::handleFindUser(const char *caName)
{
    if(caName==NULL){//对读取出来的信息进行判断
        return -1;//为空直接返回
    }
    QSqlQuery q;
    QString sql=QString("select online from user_info where name='%1'").arg(caName);
    if(!q.exec(sql)){
        return -1;
    }
    if(q.next()){
        return q.value(0).toInt();
    }
    return 2;
}

QStringList OperateDB::handleOnlineUser()
{
    QSqlQuery q;
    QStringList res;
    QString sql=QString("select name from user_info where online=1");
    q.exec(sql);
    while(q.next()){
        res.append(q.value(0).toString());
    }
    return res;
}

int OperateDB::handleAddFriend(const char *caCurName, const char *caTarName)
{
    if(caCurName==NULL || caTarName==NULL){//对读取出来的信息进行判断
        return -1;//为空直接返回
    }
    if(strcmp(caCurName,caTarName)==0){//不允许添加自己为好友
        return -3;//返回-3，客户端提示"不能添加自己为好友"
    }
    QString sql=QString (R"(
               select * from friend where
               (
               user_id=(select id from user_info where name='%1')
               and
               friend_id=(select id from user_info where name='%2')
               )
               or
               (
               user_id=(select id from user_info where name='%2')
               and
               friend_id=(select id from user_info where name='%1')
               )
               )").arg(caCurName).arg(caTarName);
    qDebug()<<"判断是否是好友 sql"<<sql;
    QSqlQuery q;
    q.exec(sql);
    if(q.next()){
        return -2;
    }
    sql=QString("select online from user_info where name='%1'").arg(caTarName);
    qDebug()<<"查询用户是否在线 sql"<<sql;
    q.exec(sql);
    if(q.next()){
        return q.value(0).toInt();
    }
    return -1;
}

bool OperateDB::handleAddFriendAgree(const char *caCurName, const char *caTarName)
{
    if(caCurName==NULL || caTarName==NULL){//对读取出来的信息进行判断
        return -1;//为空直接返回
    }
    QString sql=QString(R"(
                   insert into friend(user_id,friend_id)
                   select u1.id,u2.id
                   from user_info u1,user_info u2
                   where u1.name='%1' and u2.name='%2'
                        )").arg(caCurName).arg(caTarName);
    QSqlQuery q;
    return q.exec(sql);
}

QStringList OperateDB::handleFlushFriend(const char *caCurName)
{
    QStringList res;
    if(caCurName==NULL){//对读取出来的信息进行判断
        return res;//为空直接返回
    }
    // 好友列表只应包含"其他用户"：用 name<>'%1' 显式排除自己，
    // 防止历史上遗留的自加好友关系(id,id)把自己拉回列表
    QString sql=QString(R"(
                     select name from user_info
                        where name<>'%1'
                        and id in(
                         select user_id from friend where
                        friend_id=(select id from user_info where name='%1')
                        union
                         select friend_id from friend where
                        user_id=(select id from user_info where name='%1')
                        ) and online=1
                        )").arg(caCurName);
    QSqlQuery q;
    q.exec(sql);
    while(q.next()){
        res.append(q.value(0).toString());
    }
    return res;
}

OperateDB::OperateDB(QObject *parent) : QObject(parent)
{
    m_db=QSqlDatabase::addDatabase("QMYSQL");//创建数据库连接句柄
}
