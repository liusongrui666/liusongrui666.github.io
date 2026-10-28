#include"protocol.h"
#include"stdlib.h"
#include"string.h"
PDU *mkPDU(uint uiMsgLen)
{
    uint uiTotalLen=uiMsgLen+sizeof(PDU);//对总长度赋值
    PDU* pdu=(PDU*)malloc(uiTotalLen);//开辟空间
    if(pdu==NULL){//对开辟的空间进行判断
        exit(1);//终止进程
    }
    memset(pdu,0,uiTotalLen);//开辟成功进行初始化
    pdu->uiTotalLen=uiTotalLen;//赋值
    pdu->uiMsgLen=uiMsgLen;//赋值
    return pdu;
}
