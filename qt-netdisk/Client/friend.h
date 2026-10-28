#ifndef FRIEND_H
#define FRIEND_H

#include "chat.h"
#include "onlineuser.h"

#include <QWidget>

namespace Ui {
class Friend;
}

class Friend : public QWidget
{
    Q_OBJECT

public:
    explicit Friend(QWidget *parent = nullptr);
    void flushFriend();
    void update_LW(QStringList friendList);
    OnlineUser* m_pOnlineUser;
    Chat* m_pChat;
    ~Friend();

private slots:
    void on_findUser_PB_clicked();

    void on_onlineUser_PB_clicked();

    void on_flush_PB_clicked();

    void on_del_PB_clicked();

    void on_chat_PB_clicked();

private:
    Ui::Friend *ui;
};

#endif // FRIEND_H
