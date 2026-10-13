var e=[{title:{en:`RESTCONF: connection refused`,hi:`RESTCONF: connection refused`},ticket:{en:`The voice team script on DEVBOX cannot reach RESTCONF on DSW1 (192.168.60.2). Ping works. The running config of DSW1 already contains restconf, a user automation and local authentication for the web server.`,hi:`DEVBOX par voice team ki script DSW1 (192.168.60.2) par RESTCONF tak nahi pahunch paati. Ping chalta hai. DSW1 ke running config mein pehle se restconf, user automation aur web server ke liye local authentication hai.`},out:`DEVBOX> ping 192.168.60.2
Reply from 192.168.60.2: bytes=32 time=1ms TTL=255
DEVBOX> rest GET 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1
rest: (7) Failed to connect to 192.168.60.2 port 443 after 4 ms: Connection refused

DSW1# ! HTTPS server status
HTTP server authentication method: local
HTTP secure server capability: Present
HTTP secure server status: Disabled
HTTP secure server port: 443
 Session module Name  Handle Status   Secure-status  Description
 restconf           5      Inactive Inactive       RESTCONF (YANG over HTTPS)`,q:{en:`What fixes the connection?`,hi:`Connection kya theek karega?`},o:[{en:`Enable netconf-yang so port 830 opens`,hi:`netconf-yang enable karo taaki port 830 khule`},{en:`Enable the HTTPS secure server on DSW1`,hi:`DSW1 par HTTPS secure server enable karo`},{en:`Give the user automation privilege 15`,hi:`User automation ko privilege 15 do`},{en:`Add a default route on DEVBOX`,hi:`DEVBOX par default route jodo`}],a:1,w:{en:`Refused (not timeout) means the host is up but nothing listens on 443. The secure server is Disabled and the restconf module Inactive: the restconf command does not start the web server. Enable the secure-server command. NETCONF uses a different port, privilege matters only after a connection, and routing already works.`,hi:`Refused (timeout nahi) ka matlab host up hai par 443 par koi nahi sun raha. Secure server Disabled aur restconf module Inactive hai: restconf command web server start nahi karti. secure-server command enable karo. NETCONF alag port use karta hai, privilege connection ke baad hi matter karta hai, aur routing pehle se chal rahi hai.`}},{title:{en:`Login works, access denied`,hi:`Login chalta hai, access denied`},ticket:{en:`After the HTTPS server was enabled, every RESTCONF call from DEVBOX to DSW1 returns 403. The team suspects the password and wants to reset it.`,hi:`HTTPS server enable hone ke baad, DEVBOX se DSW1 ki har RESTCONF call 403 deti hai. Team ko password par shak hai aur woh use reset karna chahti hai.`},out:`DEVBOX> rest GET 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1
HTTP/1.1 403 Forbidden
Server: nginx
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "access-denied",
        "error-message": "user \\"automation\\" has privilege level 1; API access needs privilege level 15"
      }
    ]
  }
}

DSW1# show running-config | include username
username automation secret 9 $9$Hq3nV0bT1cJx9E$R2d5mQ8pK7wZ4yL1sA6fB3gN0vC9xE2tU5iO8pJ7hWk`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Reset the password to ApiPass1 again`,hi:`Password dobara ApiPass1 par reset karo`},{en:`Switch the web server to enable-password authentication`,hi:`Web server ko enable-password authentication par switch karo`},{en:`Send the request with PATCH instead of GET`,hi:`Request GET ki jagah PATCH se bhejo`},{en:`Recreate the user with privilege 15 and the same secret`,hi:`User ko privilege 15 aur same secret ke saath dobara banao`}],a:3,w:{en:`403 means authentication succeeded but the user is not authorised; a wrong password would give 401. The username line has no privilege keyword, so it is level 1. Use username automation privilege 15 secret ApiPass1. Changing the method would break authentication, and the verb is not the issue.`,hi:`403 ka matlab authentication ho gaya par user authorised nahi; galat password 401 deta. Username line mein privilege keyword nahi hai, isliye woh level 1 hai. username automation privilege 15 secret ApiPass1 use karo. Method badalne se authentication toot jaayega, aur verb problem nahi hai.`}},{title:{en:`The JSON file uses the wrong name`,hi:`JSON file galat naam use karti hai`},ticket:{en:`Now GET works. POSTing vlan30.json to create VLAN 30 on DSW1 fails with 400.`,hi:`Ab GET chalta hai. DSW1 par VLAN 30 banane ke liye vlan30.json ka POST 400 ke saath fail hota hai.`},out:`DEVBOX> cat vlan30.json
{
  "nk-native:vlan-list": [
    {
      "vlan_id": "30",
      "name": "VOICE"
    }
  ]
}
DEVBOX> rest POST 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1 -d @vlan30.json
HTTP/1.1 400 Bad Request
{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "unknown-element",
        "error-message": "unknown element \\"vlan_id\\" in nk-native:vlan-list (valid: id, name)"
      }
    ]
  }
}
DEVBOX> yang tree nk-native
     +--rw vlan                          {switch}?
     |  +--rw vlan-list* [id]
     |     +--rw id      uint16
     |     +--rw name?   string`,q:{en:`What must change first?`,hi:`Pehle kya badalna chahiye?`},o:[{en:`Rename the member vlan_id to id, the list key in the model`,hi:`Member vlan_id ko id karo, jo model mein list key hai`},{en:`Change POST to PUT`,hi:`POST ko PUT mein badlo`},{en:`Remove the module prefix nk-native from the top member`,hi:`Top member se module prefix nk-native hatao`},{en:`Send the body as XML instead of JSON`,hi:`Body JSON ki jagah XML mein bhejo`}],a:0,w:{en:`unknown-element names the problem: the model has no vlan_id. The tree shows the key is id. The verb, encoding and prefix are correct; RFC 7951 JSON needs the module-qualified top member.`,hi:`unknown-element problem ka naam batata hai: model mein vlan_id nahi hai. Tree dikhata hai key id hai. Verb, encoding aur prefix sahi hain; RFC 7951 JSON ko module-qualified top member chahiye.`}},{title:{en:`A number in quotes`,hi:`Quotes mein number`},ticket:{en:`After renaming the member, the POST still fails with 400, but with a different error.`,hi:`Member ka naam badalne ke baad bhi POST 400 ke saath fail hota hai, par alag error ke saath.`},out:`DEVBOX> sed -i 's/vlan_id/id/' vlan30.json
DEVBOX> rest POST 192.168.60.2/restconf/data/nk-native:native/vlan -u automation:ApiPass1 -d @vlan30.json
HTTP/1.1 400 Bad Request
{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
        "error-message": "invalid value \\"30\\" for leaf id (expected a number 2-4094 without quotes)"
      }
    ]
  }
}`,q:{en:`Which body will be accepted and what code will it return?`,hi:`Kaunsi body accept hogi aur kaunsa code degi?`},o:[{en:`{"nk-native:vlan-list": [{"id": "030", "name": "VOICE"}]}, 200`,hi:`{"nk-native:vlan-list": [{"id": "030", "name": "VOICE"}]}, 200`},{en:`{"vlan-list": [{"id": 30, "name": "VOICE"}]}, 204`,hi:`{"vlan-list": [{"id": 30, "name": "VOICE"}]}, 204`},{en:`{"nk-native:vlan-list": [{"id": 30, "name": "VOICE"}]}, 201`,hi:`{"nk-native:vlan-list": [{"id": 30, "name": "VOICE"}]}, 201`},{en:`{"nk-native:vlan-list": {"id": 30}}, 409`,hi:`{"nk-native:vlan-list": {"id": 30}}, 409`}],a:2,w:{en:`id is uint16, so JSON needs the number 30 without quotes; the top member keeps its module prefix and the list is an array. A successful POST creates the entry and returns 201 Created. 409 would only appear if VLAN 30 already existed.`,hi:`id uint16 hai, isliye JSON ko bina quotes ka number 30 chahiye; top member apna module prefix rakhta hai aur list array hai. Successful POST entry banata hai aur 201 Created deta hai. 409 tabhi aata jab VLAN 30 pehle se hota.`}},{title:{en:`NETCONF rejects the loopback`,hi:`NETCONF loopback reject karta hai`},ticket:{en:`An engineer on DEVBOX tries to add Loopback100 to R1 with edit-config and gets an rpc-error instead of ok.`,hi:`DEVBOX par ek engineer edit-config se R1 par Loopback100 add karne ki koshish karta hai aur ok ki jagah rpc-error milta hai.`},out:`netconf 192.168.50.1> edit-config running <config><interfaces><interface><name>Loopback100</name><description>Managed by NETCONF</description></interface></interfaces></config>
<<<
<rpc-reply message-id="102" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <rpc-error>
    <error-type>application</error-type>
    <error-tag>unknown-namespace</error-tag>
    <error-severity>error</error-severity>
    <error-message xml:lang="en">element <interfaces> has no namespace; add the model namespace, e.g. <interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"></error-message>
  </rpc-error>
</rpc-reply>`,q:{en:`What is wrong with the request?`,hi:`Request mein kya galat hai?`},o:[{en:`The target must be candidate, not running`,hi:`Target running nahi, candidate hona chahiye`},{en:`NETCONF needs JSON, not XML`,hi:`NETCONF ko XML nahi, JSON chahiye`},{en:`The interfaces element lacks the ietf-interfaces namespace (and a new loopback also needs its type)`,hi:`interfaces element mein ietf-interfaces namespace nahi hai (aur naye loopback ko type bhi chahiye)`},{en:`The session must be locked before any edit`,hi:`Kisi bhi edit se pehle session lock hona chahiye`}],a:2,w:{en:`NETCONF XML must carry the model namespace; without it the device cannot tell which module <interfaces> belongs to. Add xmlns for ietf-interfaces (and ietf-ip for ipv4), plus the mandatory type ianaift:softwareLoopback for a new interface. R1 has writable-running, NETCONF is XML only, and a lock is optional.`,hi:`NETCONF XML mein model namespace hona chahiye; uske bina device nahi bata sakta ki <interfaces> kis module ka hai. ietf-interfaces ka xmlns jodo (aur ipv4 ke liye ietf-ip), saath mein naye interface ke liye mandatory type ianaift:softwareLoopback. R1 ke paas writable-running hai, NETCONF sirf XML hai, aur lock optional hai.`}},{title:{en:`Commit is not supported`,hi:`Commit supported nahi`},ticket:{en:`A script written for another vendor edits the candidate datastore on R1 and then sends commit. Both RPCs fail.`,hi:`Doosre vendor ke liye likhi ek script R1 par candidate datastore edit karti hai aur phir commit bhejti hai. Dono RPCs fail hoti hain.`},out:`R1# show netconf-yang status
netconf-yang: enabled
netconf-yang candidate-datastore: disabled
netconf-yang ssh port: 830

netconf 192.168.50.1> commit
<<<
<rpc-reply message-id="105" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0">
  <rpc-error>
    <error-type>protocol</error-type>
    <error-tag>operation-not-supported</error-tag>
    <error-severity>error</error-severity>
    <error-message xml:lang="en"><commit> needs the :candidate (or :startup/:validate) capability; this device writes straight to the running datastore</error-message>
  </rpc-error>
</rpc-reply>`,q:{en:`How should the script work on R1?`,hi:`Script ko R1 par kaise kaam karna chahiye?`},o:[{en:`Send edit-config to running (optionally with lock/unlock) and drop the commit, or enable the candidate datastore on the router`,hi:`running par edit-config bhejo (optionally lock/unlock ke saath) aur commit hatao, ya router par candidate datastore enable karo`},{en:`Use copy-config from candidate to running`,hi:`candidate se running tak copy-config use karo`},{en:`Switch to RESTCONF and POST to /restconf/candidate`,hi:`RESTCONF par switch karo aur /restconf/candidate par POST karo`},{en:`Retry the commit with a higher message-id`,hi:`Commit ko bade message-id ke saath retry karo`}],a:0,w:{en:`The hello does not advertise :candidate and the status shows candidate-datastore disabled, so edits go straight to running. Either target running or enable the feature (netconf-yang feature candidate-datastore). There is no candidate to copy, RESTCONF has no candidate datastore, and the message-id is irrelevant.`,hi:`Hello :candidate advertise nahi karta aur status candidate-datastore disabled dikhata hai, isliye edits seedha running mein jaate hain. Ya to running ko target karo ya feature enable karo (netconf-yang feature candidate-datastore). Copy karne ke liye candidate hai hi nahi, RESTCONF mein candidate datastore nahi, aur message-id ka koi matlab nahi.`}},{title:{en:`Nightly job returns 409`,hi:`Nightly job 409 deta hai`},ticket:{en:`A nightly job that ensures Loopback100 exists on R1 worked on its first run. Every run since then fails.`,hi:`Ek nightly job jo pakka karta hai ki R1 par Loopback100 exist kare, pehli run mein chala. Tab se har run fail hota hai.`},out:`DEVBOX> rest POST 192.168.50.1/restconf/data/ietf-interfaces:interfaces -u devnet:DevNet123 -d @lo100.json
HTTP/1.1 409 Conflict
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "data-exists",
        "error-message": "interface Loopback100 already exists"
      }
    ]
  }
}`,q:{en:`What is the best change to the job?`,hi:`Job mein sabse achha change kya hai?`},o:[{en:`Delete Loopback100 before every POST`,hi:`Har POST se pehle Loopback100 delete karo`},{en:`Ignore all 4xx codes`,hi:`Saare 4xx codes ignore karo`},{en:`Add privilege 15 to devnet`,hi:`devnet ko privilege 15 do`},{en:`Use PATCH (merge) or PUT (replace) on .../interface=Loopback100 so the job is idempotent`,hi:`.../interface=Loopback100 par PATCH (merge) ya PUT (replace) use karo taaki job idempotent ho`}],a:3,w:{en:`POST only creates, so a second POST of existing data returns 409 data-exists. PATCH merges and PUT creates or replaces, so repeated runs succeed with 204. Deleting first causes an outage window, ignoring all errors hides real failures, and privilege is fine (it would be 403).`,hi:`POST sirf banata hai, isliye existing data ka doosra POST 409 data-exists deta hai. PATCH merge karta hai aur PUT banata ya replace karta hai, isliye repeated runs 204 ke saath succeed hote hain. Pehle delete karne se outage window banti hai, saare errors ignore karna asli failures chhupata hai, aur privilege theek hai (warna 403 hota).`}},{title:{en:`Catalyst Center dashboard goes blank`,hi:`Catalyst Center dashboard blank ho jaata hai`},ticket:{en:`A health dashboard polls Catalyst Center every five minutes. It works after start-up, then about an hour later every call fails until the script is restarted.`,hi:`Ek health dashboard har paanch minute mein Catalyst Center poll karta hai. Start-up ke baad chalta hai, phir lagbhag ek ghante baad har call fail hoti hai jab tak script restart na ho.`},out:`09:00:02 POST /dna/system/api/v1/auth/token -> 200 {"Token": "eyJhbGciOiJSUzI1NiIs..."}
09:00:03 GET /dna/intent/api/v1/network-device -> 200 (response: 212 devices)
09:55:03 GET /dna/intent/api/v1/network-device -> 200 (response: 212 devices)
10:00:03 GET /dna/intent/api/v1/network-device -> 401 Unauthorized
10:05:03 GET /dna/intent/api/v1/network-device -> 401 Unauthorized`,q:{en:`What should the script do?`,hi:`Script ko kya karna chahiye?`},o:[{en:`Ask an admin to give the API user more roles`,hi:`Admin se API user ko zyada roles dilwao`},{en:`On a 401, request a new token from the auth endpoint and retry the call with the new X-Auth-Token`,hi:`401 aane par auth endpoint se naya token maango aur naye X-Auth-Token ke saath call retry karo`},{en:`Switch the calls to the /dataservice path`,hi:`Calls ko /dataservice path par switch karo`},{en:`Poll every minute so the token stays active`,hi:`Har minute poll karo taaki token active rahe`}],a:1,w:{en:`The token expires after about one hour, which produces 401 (identity), not 403 (permission). Re-authenticate and retry. /dataservice belongs to SD-WAN Manager, and polling more often does not extend a token lifetime.`,hi:`Token lagbhag ek ghante mein expire hota hai, jo 401 (identity) deta hai, 403 (permission) nahi. Dobara authenticate karo aur retry karo. /dataservice SD-WAN Manager ka hai, aur zyada poll karne se token ki umar nahi badhti.`}}];export{e as default};