var e=[{title:{en:`Login fails on the first call`,hi:`Pehli call par login fail`},ticket:{en:`A new script gets this reply from R1 on its very first call. The router is reachable. What is the problem?`,hi:`Nayi script ko R1 se pehli hi call par yeh reply mila. Router reachable hai. Samasya kya hai?`},out:`HTTP/1.1 401 Unauthorized
Content-Type: application/yang-data+json
WWW-Authenticate: Basic realm="restconf"

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "access-denied",
        "error-message": "authentication failed for user \\"apiuser\\""
      }
    ]`,q:{en:`What should you check first?`,hi:`Pehle kya check karoge?`},o:[{en:`The JSON body`,hi:`JSON body`},{en:`The interface name in the path`,hi:`Path mein interface ka naam`},{en:`The username and password (they are case sensitive)`,hi:`Username aur password (case sensitive hote hain)`},{en:`The OSPF neighbours`,hi:`OSPF neighbours`}],a:2,w:{en:`401 Unauthorized with authentication failed means the server does not accept the credentials. Body, path and routing are checked later.`,hi:`401 Unauthorized aur authentication failed ka matlab server credentials accept nahi karta. Body, path aur routing baad mein check hote hain.`}},{title:{en:`The module that does not exist`,hi:`Woh module jo hai hi nahi`},ticket:{en:`Login now works, but this call for Loopback0 fails. Read the message. What is wrong?`,hi:`Login ab chalta hai, par Loopback0 ki yeh call fail hoti hai. Message padho. Kya galat hai?`},out:`HTTP/1.1 404 Not Found
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
        "error-message": "uri keypath not found (unknown top-level node \\"ietf-interface:interfaces\\")"
      }
    ]
  }`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Correct the module name to ietf-interfaces`,hi:`Module naam ko ietf-interfaces karo`},{en:`Change the password`,hi:`Password badlo`},{en:`Switch the verb to POST`,hi:`Verb ko POST karo`},{en:`Restart the router`,hi:`Router restart karo`}],a:0,w:{en:`404 with unknown top-level node points at the path. The module name is misspelled, missing the s at the end of interfaces.`,hi:`404 aur unknown top-level node path ki taraf ishaara karta hai. Module naam ki spelling galat hai, interfaces ke end ka s missing hai.`}},{title:{en:`A slash in the key`,hi:`Key mein slash`},ticket:{en:`You ask for GigabitEthernet0/1 and the router answers with this. What is the likely cause?`,hi:`Aap GigabitEthernet0/1 maangte ho aur router yeh jawab deta hai. Sambhavit wajah kya hai?`},out:`HTTP/1.1 400 Bad Request
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
        "error-message": "key value \\"GigabitEthernet0/1\\" contains an unencoded \\"/\\"; encode it as %2F, e.g. interface=GigabitEthernet0%2F1"
      }
    ]
  }`,q:{en:`Which change fixes the call?`,hi:`Kaunsa badlav call theek karta hai?`},o:[{en:`Use lowercase interface names`,hi:`Interface naam lowercase karo`},{en:`Add a trailing slash to the path`,hi:`Path ke end mein slash lagao`},{en:`Send the call twice`,hi:`Call do baar bhejo`},{en:`Write the key as GigabitEthernet0%2F1`,hi:`Key ko GigabitEthernet0%2F1 likho`}],a:3,w:{en:`A slash is a path separator, so a slash inside a key must be escaped as %2F.`,hi:`Slash path separator hai, isliye key ke andar ke slash ko %2F se escape karna padta hai.`}},{title:{en:`POST to a description`,hi:`Description par POST`},ticket:{en:`A script tries to set an interface description using POST and gets this reply. What should it use?`,hi:`Script POST se interface description set karna chahti hai aur yeh reply milta hai. Use kya use karna chahiye?`},out:`HTTP/1.1 405 Method Not Allowed
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "operation-not-supported",
        "error-message": "POST creates a child resource; use PATCH or PUT to change a leaf"
      }
    ]
  }`,q:{en:`Which verb fits the job?`,hi:`Kaunsa verb is kaam ke liye theek hai?`},o:[{en:`GET on the description leaf`,hi:`Description leaf par GET`},{en:`PATCH on the description leaf`,hi:`Description leaf par PATCH`},{en:`DELETE on the interface`,hi:`Interface par DELETE`},{en:`POST to the router address`,hi:`Router address par POST`}],a:1,w:{en:`A description is one value, not a list. POST creates children, so 405 appears. PATCH or PUT changes a leaf.`,hi:`Description ek value hai, list nahi. POST children banata hai, isliye 405 aata hai. Leaf ko PATCH ya PUT badalta hai.`}},{title:{en:`Wrong Content-Type`,hi:`Galat Content-Type`},ticket:{en:`The file holds JSON, but the call returns this reply. What explains it?`,hi:`File mein JSON hai, par call yeh reply deti hai. Kya samjhata hai?`},out:`HTTP/1.1 415 Unsupported Media Type
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
        "error-message": "Content-Type application/xml is not supported for request bodies in this lab; send application/yang-data+json"
      }
    ]`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Increase the timeout`,hi:`Timeout badhao`},{en:`Use a longer password`,hi:`Lamba password use karo`},{en:`Remove the wrong Content-Type header or set it to the JSON media type`,hi:`Galat Content-Type header hatao ya use JSON media type par set karo`},{en:`Escape the slash in the key`,hi:`Key ka slash escape karo`}],a:2,w:{en:`415 means the server cannot read the body format announced by the header. The lab accepts JSON bodies only.`,hi:`415 ka matlab header ne jo body format bataya server use padh nahi sakta. Lab sirf JSON bodies leta hai.`}},{title:{en:`No status line at all`,hi:`Status line hai hi nahi`},ticket:{en:`A script prints only this one line for R1 and no status code. What does it mean?`,hi:`Script R1 ke liye sirf yeh ek line print karti hai aur koi status code nahi. Iska kya matlab hai?`},out:`rest: (7) Failed to connect to 10.99.0.1 port 443 after 4 ms: Connection refused`,q:{en:`Where do you look?`,hi:`Kahan dekhoge?`},o:[{en:`Whether the HTTPS service is enabled and the port is reachable on R1`,hi:`R1 par HTTPS service enabled hai aur port reachable hai ya nahi`},{en:`The JSON syntax of the body`,hi:`Body ka JSON syntax`},{en:`The Accept header`,hi:`Accept header`},{en:`The method name`,hi:`Method ka naam`}],a:0,w:{en:`Connection refused means nothing is listening on the port, so no HTTP reply exists. Check the HTTPS server, RESTCONF and any firewall.`,hi:`Connection refused ka matlab port par koi sun nahi raha, isliye HTTP reply hai hi nahi. HTTPS server, RESTCONF aur firewall check karo.`}},{title:{en:`The duplicate create`,hi:`Duplicate create`},ticket:{en:`A job that creates Loopback51 with POST runs twice. The second run prints this. What happened, and what would make the job safe to repeat?`,hi:`Loopback51 banane wala POST job do baar chalta hai. Doosri baar yeh print hota hai. Kya hua, aur job ko dohrane layak kaise banaye?`},out:`HTTP/1.1 409 Conflict
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "data-exists",
        "error-message": "interface Loopback51 already exists"
      }
    ]`,q:{en:`Choose the best answer.`,hi:`Sabse achha jawab chuno.`},o:[{en:`The password expired; rotate it`,hi:`Password expire hua; rotate karo`},{en:`The router is down; wait for 5xx to clear`,hi:`Router down hai; 5xx hatne ka intezaar karo`},{en:`The URL is wrong; add the port`,hi:`URL galat hai; port jodo`},{en:`The object already exists (409). Use PUT, which is idempotent, or check with GET first`,hi:`Object pehle se hai (409). PUT use karo jo idempotent hai, ya pehle GET se check karo`}],a:3,w:{en:`409 Conflict means the state clashes with the request. PUT to the full address creates or replaces and can be repeated safely.`,hi:`409 Conflict ka matlab state request se takra rahi hai. Poore address par PUT banata ya replace karta hai aur safely dohraya ja sakta hai.`}}];export{e as default};