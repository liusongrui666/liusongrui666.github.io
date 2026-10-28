#include "operatedb.h"
#include "server.h"
#include<qDebug>
#include <QApplication>
#include <sodium.h>
typedef struct ABC{
    int a;
    int b;
    char c[];
}ABC;
int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    if (sodium_init() < 0) {
        qFatal("libsodium initialization failed");
    }

    Server::getInstance();
    //w.show();
    OperateDB::getInstance().connectSQL();
    return a.exec();
}
