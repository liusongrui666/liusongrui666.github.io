#include "client.h"
#include "index.h"
#include "protocol.h"
#include "ui_client.h"

#include <QFile>
#include <QDebug>
#include <QHostAddress>
#include <QMessageBox>
namespace {

/**
 * 用户名规则：3~32 位 ASCII 字母、数字、下划线。
 *
 * 服务端会再校验一次。
 * 客户端校验只是 UX，不能作为安全边界。
 */
bool isValidUserName(const QString& name)
{
    // QString::toUtf8 返回 UTF-8 编码的 QByteArray。
    // 用户名限定 ASCII，所以字节数等于字符数。
    const QByteArray bytes = name.toUtf8();

    // size() 返回字节数。
    if (bytes.size() < 3 || bytes.size() > 32) {
        return false;
    }

    // at(i) 返回第 i 个字节。
    for (int i = 0; i < bytes.size(); ++i) {
        const char c = bytes.at(i);
        const bool ok =
            (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') ||
            c == '_';
        if (!ok) {
            return false;
        }
    }
    return true;
}

/**
 * 密码规则：8~32 个 UTF-8 字节。
 *
 * 注意是字节数，不是字符数。
 * 中文密码按 UTF-8 可能占 3 字节。
 */
bool isValidPassword(const QString& password)
{
    const QByteArray bytes = password.toUtf8();
    return bytes.size() >= 8 && bytes.size() <= 32;
}

/**
 * 用户名统一小写。
 *
 * 服务端也会转小写；
 * 客户端提前转，保证 m_strLOginName 和数据库、目录一致。
 */
QString normalizeUserName(const QString& name)
{
    // QString::toLower 返回转小写后的新字符串。
    return name.toLower();
}

} // namespace

Client::Client(QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::Client)
{
    ui->setupUi(this);
    loadconfig();//将加载配置文件放到构造函数里
    m_socket.connectToHost(QHostAddress(m_strIP),m_usPort);//用IP地址和端口号通过TCP实现通信
    connect(&m_socket,&QTcpSocket::connected,this,&Client::showConnect);//将信号槽函数和连接信号建立联系
    connect(&m_socket,&QTcpSocket::readyRead,this,&Client::recvMsg);
    m_prh=new Reshandle;
}

Client::~Client()
{
    delete m_prh;
    delete ui;
}

void Client::sendMsg(PDU *pdu)
{
    m_socket.write((char*)pdu,pdu->uiTotalLen);//把PDU写入socket
    qDebug()<<"send msg pdu->uiTotalLen"<<pdu->uiTotalLen//打印出来
            <<"pdu->uiMegLen"<<pdu->uiMsgLen
            <<"pdu->uiType"<<pdu->uiType;
    free(pdu);//释放PDU
    pdu=NULL;//置空
}

PDU *Client::readMsg()
{
    qDebug()<<"recvMsg 接收消息长度"<<m_socket.bytesAvailable();
    uint uiPDULen=0;//定义缓冲区，用来读消息的长度
    m_socket.read((char*)&uiPDULen,sizeof(uint));//将数据读入缓冲区
    uint uiMsgLen=uiPDULen-sizeof(PDU);//得到柔性数组的大小
    PDU *pdu=mkPDU(uiMsgLen);//根据长度申请空间
    m_socket.read((char*)pdu+sizeof(uint),uiPDULen-sizeof(uint));//参数1：偏移到正确位置 参数2：后面还有的长度
    return pdu;
}

void Client::handleMsg(PDU *pdu)
{
    qDebug()<<"handleMsg pdu->uiTotalLen"<<pdu->uiTotalLen//打印输出
            <<"pdu->uiMsgLen"<<pdu->uiMsgLen
            <<"pdu->uiType"<<pdu->uiType;
    m_prh->pdu=pdu;//把收到的pdu交给响应处理器，否则Reshandle里读到的是野指针
    switch(pdu->uiType){//对pdu进行类型判断
    case ENUM_TYPE_RESPOND:{
        m_prh->regist();
        break;
        }
    case ENUM_TYPE_LOGIN_RESPOND:{
        m_prh->login();
        break;
        }
    case ENUM_TYPE_FIND_USER_RESPOND:{
        m_prh->findUser();
        break;
        }
    case ENUM_TYPE_ONLINE_USER_RESPOND:{
        m_prh->onlineUser();
        break;
        }
    case ENUM_TYPE_ADD_FRIEND_RESPOND:{
        m_prh->addFriend();
        break;
        }
    case ENUM_TYPE_ADD_FRIEND_RESEND:{
        m_prh->addFriendResend();
        break;
        }
    case ENUM_TYPE_ADD_FRIEND_AGREE_RESPOND:{
        m_prh->addFriendAgree();
        break;
        }
    case ENUM_TYPE_FLUSH_FRIEND_RESPOND:{
        m_prh->flushFriend();
        break;
        }
    case ENUM_TYPE_DEL_FRIEND_RESPOND:{
        m_prh->delFriend();
        break;
        }
    case ENUM_TYPE_CHAT_RESEND:{
        m_prh->chat();
        break;
        }
    case ENUM_TYPE_MKDIR_RESPOND:{
        m_prh->mkdir();
        break;
        }
    case ENUM_TYPE_FLUSH_FILE_RESPOND:{
        m_prh->flushFile();
        break;
        }
    case ENUM_TYPE_DEL_FILE_RESPOND:{
        m_prh->delFile();
        break;
        }
    case ENUM_TYPE_RENAME_RESPOND:{
        m_prh->rename();
        break;
        }
    case ENUM_TYPE_UPLOAD_INIT_RESPOND:{
        m_prh->uploadfileinit();
        break;
        }
    case ENUM_TYPE_UPLOAD_FILE_DATA_RESPOND:{
        m_prh->uploadfiledata();
        break;
        }
    case ENUM_TYPE_UPLOAD_CHUNK_RESPOND:{
        m_prh->uploadChunk();
        break;
        }
    case ENUM_TYPE_UPLOAD_FINISH_RESPOND:{
        m_prh->finishUpload();
        break;
        }
    case ENUM_TYPE_UPLOAD_RESUME_RESPOND:{
        m_prh->resumeUpload();
        break;
        }
    case ENUM_TYPE_DOWNLOAD_FILE_RESPOND:{
        m_prh->downloadFile();
        break;
        }
    case ENUM_TYPE_DOWNLOAD_FILE_DATA_RESPOND:{
        m_prh->downloadFileData();
        break;
        }
    default:
        break;
    }
}

void Client::loadconfig()
{
    QFile file("://connect.config");//打开文件
    if(!file.open(QIODevice::ReadOnly)){//判断是否已只读格式打开
        qDebug()<<"打开失败，请重试";//输出错误信息
        return;
    }
    QByteArray baData=file.readAll();//以函数返回的QByteArray格式读取文件中的值
    QString strData=QString(baData);//转为字符串
    qDebug()<<"strData"<<strData;//打印输出
    QStringList strList=strData.split("\r\n");//去除乱码
    m_strIP=strList[0];//进行赋值
    m_usPort=strList[1].toUShort();//进行赋值，并且将字符串转为quint16
    m_strRootPath=strList[2];
    qDebug()<<"IP"<<m_strIP<<"Port"<<m_usPort;
    file.close();//关闭文件
}
void Client::showConnect(){//信号槽函数
    qDebug()<<"连接成功";
}

void Client::recvMsg()
{
    qDebug()<<"recvMsg 接收消息长度"<<m_socket.bytesAvailable();
    QByteArray data=m_socket.readAll();
    buffer.append(data);
    while(buffer.size()>=int(sizeof(PDU))){
        PDU* pdu=(PDU*)buffer.data();
        if(buffer.size()<int(pdu->uiTotalLen)){
            break;
        }
        handleMsg(pdu);
        buffer.remove(0,pdu->uiTotalLen);
    }

}
Client &Client::getInstance(){
    static Client instance;//定义唯一的单例
    return instance;//返回单例
}

//void Client::on_pushButton_clicked()
//{
//    QString strMsg=ui->input_LE->text();//读取写入的消息
//    PDU* pdu=mkPDU(strMsg.toStdString().size()+1);//存入到柔性数组里面，+1是为了留一个/0
//    pdu->uiType=ENUM_TYPE_REQUEST;//消息类型赋值
//    memcpy(pdu->caMsg,strMsg.toStdString().c_str(),strMsg.toStdString().size());//消息赋值
//    m_socket.write((char*)pdu,pdu->uiTotalLen);//写入socket
//    qDebug()<<"send msg pdu->uiTotalLen"<<pdu->uiTotalLen
//            <<"pdu->uiMegLen"<<pdu->uiMsgLen
//            <<"pdu->uiType"<<pdu->uiType
//            <<"pdu->caData"<<pdu->caData
//            <<"pdu->caMsg"<<pdu->caMsg;
//    free(pdu);
//    pdu=NULL;
//}

void Client::on_regist_PB_clicked()
{
    // ui->name_LE 是用户名输入框（QLineEdit）。
    // text() 返回输入框当前文本，类型是 QString。
    const QString strName = ui->name_LE->text();

    // ui->pwd_LE 是密码输入框。
    // text() 返回密码明文；客户端只把它用于本次发送。
    const QString strPwd = ui->pwd_LE->text();

    // 客户端校验只是 UX，服务端仍会再校验。
    if (!isValidUserName(strName) || !isValidPassword(strPwd)) {
        // QMessageBox::critical 是 Qt 静态函数，弹出错误提示框。
        // 参数 1：this，父窗口指针。
        // 参数 2："注册"，窗口标题。
        // 参数 3：提示内容。
        QMessageBox::critical(
            this,
            "注册",
            "用户名需为 3-32 位字母/数字/下划线，"
            "密码需为 8-32 个 UTF-8 字节");
        return;
    }

    // normalizeUserName 把用户名转小写。
    // QString::toUtf8 返回 UTF-8 编码的 QByteArray。
    const QByteArray nameBytes =
        normalizeUserName(strName).toUtf8();

    // 密码不做大小写转换，直接取 UTF-8 字节。
    const QByteArray pwdBytes = strPwd.toUtf8();

    // mkPDU 是项目协议函数，分配一个消息体长度为 0 的 PDU。
    PDU* pdu = mkPDU();

    // memset 是 C 标准库函数，把 caData 的 64 字节全部清零。
    // 目的：短用户名/密码后面补 '\0'，不发送栈上垃圾字节。
    memset(pdu->caData, 0, sizeof(pdu->caData));

    // memcpy 是 C 标准库函数，按字节复制。
    // constData 返回 QByteArray 内部字节首地址，
    // size 返回实际 UTF-8 字节数。
    memcpy(pdu->caData,
           nameBytes.constData(),
           nameBytes.size());

    // 密码从 caData 的第 32 字节开始写。
    memcpy(pdu->caData + 32,
           pwdBytes.constData(),
           pwdBytes.size());

    // uiType 是 PDU 消息类型。
    // ENUM_TYPE_REQUEST 表示注册请求。
    pdu->uiType = ENUM_TYPE_REQUEST;

    // sendMsg 把 PDU 写入 QTcpSocket，内部会释放 pdu。
    sendMsg(pdu);
}

void Client::on_lgin_PB_clicked()
{
    // 取用户名输入框文本。
    const QString strName = ui->name_LE->text();

    // 取密码输入框文本。
    const QString strPwd = ui->pwd_LE->text();

    // 客户端格式校验，服务端仍会再校验。
    if (!isValidUserName(strName) || !isValidPassword(strPwd)) {
        // QMessageBox::critical 弹出错误框。
        // this 是父窗口；"登录" 是标题；第三个参数是内容。
        QMessageBox::critical(
            this,
            "登录",
            "用户名或密码格式不正确");
        return;
    }

    // m_strLOginName 是 Client 的成员变量，保存当前登录名。
    // normalizeUserName 转小写，保证和数据库、服务端目录一致。
    m_strLOginName = normalizeUserName(strName);

    // QString::toUtf8 返回 UTF-8 字节数组。
    const QByteArray nameBytes = m_strLOginName.toUtf8();

    // 密码按原始 UTF-8 字节发送，不做大小写转换。
    const QByteArray pwdBytes = strPwd.toUtf8();

    // 分配一个空消息体的 PDU。
    PDU* pdu = mkPDU();

    // 清零 caData，避免短字符串后面带垃圾字节。
    memset(pdu->caData, 0, sizeof(pdu->caData));

    // 用户名写入 caData[0..31]。
    memcpy(pdu->caData,
           nameBytes.constData(),
           nameBytes.size());

    // 密码写入 caData[32..63]。
    memcpy(pdu->caData + 32,
           pwdBytes.constData(),
           pwdBytes.size());

    // ENUM_TYPE_LOGIN_REQUEST 表示登录请求。
    pdu->uiType = ENUM_TYPE_LOGIN_REQUEST;

    // 写入 socket，内部会释放 pdu。
    sendMsg(pdu);
}
