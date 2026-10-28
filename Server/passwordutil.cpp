#include "passwordutil.h"
#include <sodium.h>
bool PasswordUtil::hashPassword(const QByteArray &password, QByteArray &outHash)
{
    outHash.clear();
    if(password.isEmpty()){
        return false;
    }
    char encoded[crypto_pwhash_STRBYTES];
    const int result=crypto_pwhash_str(encoded,password.constData(),static_cast<unsigned long long>(password.size()),crypto_pwhash_OPSLIMIT_INTERACTIVE,crypto_pwhash_MEMLIMIT_INTERACTIVE);
    if(result!=0){
        return false;
    }
    outHash=QByteArray(encoded);
    return true;
}

bool PasswordUtil::verifyPassword(const QByteArray &password, QByteArray &storeHash)
{
    if(password.isEmpty()||storeHash.isEmpty()){
        return false;
    }
    if(storeHash.size()>=static_cast<int>(crypto_pwhash_STRBYTES)){
        return false;
    }
    return crypto_pwhash_str_verify(storeHash.constData(),password.constData(),static_cast<unsigned long long>(password.size()))==0;
}

PasswordUtil::PasswordUtil()
{

}
