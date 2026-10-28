#ifndef STORAGEPATH_H
#define STORAGEPATH_H
#include <QString>

class StoragePath
{
public:
    static bool resolve(const QString& userRoot,const QString& virtualPath,QString& physicalPath);
    static bool validFileName(const QString& fileName);
    StoragePath();
};

#endif // STORAGEPATH_H
