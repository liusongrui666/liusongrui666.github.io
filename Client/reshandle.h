#ifndef RESHANDLE_H
#define RESHANDLE_H

#include "protocol.h"



class Reshandle
{
public:
    PDU* pdu;
    Reshandle();
    void regist();
    void login();
    void findUser();
    void onlineUser();
    void addFriend();
    void addFriendResend();
    void addFriendAgree();
    void flushFriend();
    void delFriend();
    void chat();
    void mkdir();
    void flushFile();
    void delFile();
    void rename();
    void uploadfileinit();
    void uploadfiledata();
    void uploadChunk();
    void finishUpload();
    void resumeUpload();
    void downloadFile();
    void downloadFileData();
};

#endif // RESHANDLE_H
