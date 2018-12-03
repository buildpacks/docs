+++
title="Setup your local environment"
weight=3
creatordisplayname = "Scott Sisil"
creatoremail = "ssisil@pivotal.io"
lastmodifierdisplayname = "Scott Sisil"
lastmodifieremail = "ssisil@pivotal.io"
+++

First we will want to clone a sample ruby app that you can use when developing the ruby cloud native buildpack

```
mkdir workspace
cd workspace
git clone <path to sample ruby app>
```

Next we want to create the directory where you will create your buildpack

```
cd workspace
mkdir ruby-cnb
```

Finally, make sure your local docker daemon is running by running the following command

```
docker version
```

The following output should appear

```
Client:
 Version:           18.06.1-ce
 API version:       1.38
 Go version:        go1.10.3
 Git commit:        e68fc7a
 Built:             Tue Aug 21 17:21:31 2018
 OS/Arch:           darwin/amd64
 Experimental:      false

Server:
 Engine:
  Version:          18.06.1-ce
  API version:      1.38 (minimum version 1.12)
  Go version:       go1.10.3
  Git commit:       e68fc7a
  Built:            Tue Aug 21 17:29:02 2018
  OS/Arch:          linux/amd64
  Experimental:     true
```

---
