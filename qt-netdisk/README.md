# Qt/C++ multi-user netdisk

This directory contains the Qt client/server project. The committed connect.config files contain local development placeholders only. Replace them for local use, and never commit real credentials. Build outputs and Qt Creator user files are excluded.

## Build

1. Open Client/Client.pro and Server/Server.pro with Qt Creator (Qt 5.14+).
2. Create a local `connect.config` in each target directory with three lines: server address, server port, and storage root.
3. Configure libsodium before building Server by setting the `LIBSODIUM_ROOT` qmake environment variable.\n4. Configure the server database through environment variables or a local configuration:
   - QT_DB_HOST
   - QT_DB_PORT
   - QT_DB_NAME
   - QT_DB_USER
   - QT_DB_PASSWORD
5. Build and run Server before Client.

Do not commit local passwords, database dumps, generated build directories, or Qt Creator user files.
