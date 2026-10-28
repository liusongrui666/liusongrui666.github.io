#include "client.h"
#include "index.h"

#include <QApplication>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    Client::getInstance().show();//直接通过函数定义单例
    return a.exec();
}
