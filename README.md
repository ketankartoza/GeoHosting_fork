# GeoHosting

![image](https://github.com/user-attachments/assets/ad257a1d-ade0-4f60-a65f-dcbd6f166e2b)


GeoHosting website. 

Environment:</br>

```
JENKINS_TOKEN=
```

The token of user of jenkins. Can be created on jenkins.

```
JENKINS_USER=
```

The username on the jenkins that has token.
We need to make sure the user has permission with job/build.

# GeoHosting Controller - Client

This is a python library that will be installed as middleware for create,
update or delete application to jenkins.

Environment:</br>

```
GEOHOSTING_CONTROLLER_SERVER_URL=
```

This is the url of GeoHosting controller server

```
GEOHOSTING_CONTROLLER_SERVER_TOKEN=
```

This is the token that can be generated on GeoHosting controller server.

# Functions

## Create instance

To create instance:

```
from geohosting_controller_client.activity import create
activity = create(<package-id>, <subdomain>, <user_email>)
```

**package-id** : is the selected package id on the jenkins to create the
instance.<br/>
**subdomain** : is the subdomain for the instance.<br/>
**user_email** : is the user email that calling the create.<br/>

**activity** returns the activity detail from server.
For this state, save the activity.id to database so it can be checked in
future.

To get the detail of activity, can be checked in below step.

## Check server activity

```
from geohosting_controller_client.activity import get_activity_detail
activity = get_activity_detail(<activity_id>)
```
