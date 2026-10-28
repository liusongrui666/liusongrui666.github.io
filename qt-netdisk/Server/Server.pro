QT       += core gui network sql

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

CONFIG += c++11

# The following define makes your compiler emit warnings if you use
# any Qt feature that has been marked deprecated (the exact warnings
# depend on your compiler). Please consult the documentation of the
# deprecated API in order to know how to port your code away from it.
DEFINES += QT_DEPRECATED_WARNINGS

# You can also make your code fail to compile if you use deprecated APIs.
# In order to do so, uncomment the following line.
# You can also select to disable deprecated APIs only up to a certain version of Qt.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
    clienttask.cpp \
    main.cpp \
    msghandler.cpp \
    mytcpserver.cpp \
    mytcpsocket.cpp \
    operatedb.cpp \
    passwordutil.cpp \
    protocol.cpp \
    server.cpp \
    storagepath.cpp \
    uploadmanager.cpp


HEADERS += \
    clienttask.h \
    msghandler.h \
    mytcpserver.h \
    mytcpsocket.h \
    operatedb.h \
    passwordutil.h \
    protocol.h \
    server.h \
    storagepath.h \
    uploadmanager.h


# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target

RESOURCES += \
    config.qrc
SODIUM_ROOT = $$(LIBSODIUM_ROOT)
!isEmpty(SODIUM_ROOT) {
    INCLUDEPATH += $${SODIUM_ROOT}/include
    LIBS += -L$${SODIUM_ROOT}/lib -lsodium
} else {
    warning("LIBSODIUM_ROOT is not set; configure it before building Server")
}
