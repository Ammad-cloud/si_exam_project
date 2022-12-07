# Sending products.db file via FTP

To send the products.db file, FTP must be used. The ftp-server is protected and anonymous login is not allowed. Therefore, credentials must be provided for accessing the file transfer.
To send the file a GUI such as FileZilla can be used or it can be done through a CLI:
From the directory where the products.db file is located run the command:

```
ftp ftpuser@172.104.159.213 
```

Provide now the password for the ftp user to successfully sign in to the ftp server.
 
After successfully signing in, the products.db file can be uploaded to the files directory with the command:
```
ftp> put products.db
```

Now the file has been successfully uploaded to the ftp-server.