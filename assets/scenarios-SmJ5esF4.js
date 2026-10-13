var e=[{title:{en:`HELP1 is held after the migration`,hi:`Migration ke baad HELP1 held hai`},ticket:{en:`Since Monday HELP1 on ge-0/0/1 cannot log in. The server team says the RADIUS server is up. Read the output.`,hi:`Monday se ge-0/0/1 par HELP1 login nahi kar pa raha. Server team kehti hai RADIUS server up hai. Output padho.`},out:`lab@SUPSW> show dot1x interface ge-0/0/1 detail
    Supplicant: help1, 00:50:68:99:b4:01
      Operational state:                Held
      Held reason:                      RADIUS server unreachable (no RADIUS server answered (unreachable))
      802.1X / MAC RADIUS / portal:     Server timeout / Not run / Not run

lab@SUPSW> show network-access aaa statistics authentication
Requests received: 4
Accepts: 0
Rejects: 0
Timeouts: 4
Server           Requests  Accepts  Rejects  Challenges  Timeouts
10.77.50.100     4         0        0        0           4`,q:{en:`What is the first fault?`,hi:`Pehla fault kya hai?`},o:[{en:`The user password is wrong`,hi:`User ka password galat hai`},{en:`The port is in single-secure mode`,hi:`Port single-secure mode mein hai`},{en:`The profile sends requests to 10.77.50.100, an address that is not the RADIUS server`,hi:`Profile 10.77.50.100 par requests bhej raha hai, jo RADIUS server ka address nahi`},{en:`The guest VLAN is missing`,hi:`Guest VLAN missing hai`}],a:2,w:{en:`Timeouts and a held reason of "server unreachable" point to the path, not the user. The statistics show requests going to .100 while the server is .10.`,hi:`Timeouts aur "server unreachable" held reason path ki taraf ishaara karte hain, user ki taraf nahi. Statistics dikhate hain ki requests .100 ko jaa rahi hain jabki server .10 hai.`}},{title:{en:`Requests arrive but nothing is accepted`,hi:`Requests pahunch rahi hain par kuch accept nahi hota`},ticket:{en:`After correcting the server address the users are still held. You read the log on the RADIUS server.`,hi:`Server address theek karne ke baad bhi users held hain. Aap RADIUS server ka log padhte ho.`},out:`NKRAD3> aaa-server show log
Recent events:
  RADIUS request from 10.77.50.1 ignored: shared key mismatch
  RADIUS request from 10.77.50.1 ignored: shared key mismatch`,q:{en:`What do you change?`,hi:`Aap kya badloge?`},o:[{en:`Correct the secret under access radius-server on the switch`,hi:`Switch par access radius-server ke neeche secret theek karo`},{en:`Set supplicant multiple`,hi:`Supplicant multiple set karo`},{en:`Add guest-vlan GUEST`,hi:`guest-vlan GUEST add karo`},{en:`Reset the users passwords`,hi:`Users ke passwords reset karo`}],a:0,w:{en:`The server sees the switch but ignores its requests because the shared secrets differ. The switch sees timeouts. The fix is the secret, not the users.`,hi:`Server switch ko dekhta hai par uski requests ignore karta hai kyunki shared secrets alag hain. Switch ko timeouts dikhte hain. Fix secret hai, users nahi.`}},{title:{en:`Kabir cannot log in`,hi:`Kabir login nahi kar pa raha`},ticket:{en:`Riya and the printer work, Kabir is held. Read the output.`,hi:`Riya aur printer chal rahe hain, Kabir held hai. Output padho.`},out:`lab@FLOOR3> show dot1x authentication-failed-users
Total number of failed users: 1
Interface     MAC address          User              Reason
ge-0/0/2.0    00:50:f3:5f:6f:01    kabir             rejected by RADIUS server

NKRAD> aaa-server show log
Recent events:
  802.1X (EAP-MD5) FAIL for kabir (NAS 172.20.50.1, ge-0/0/2): wrong password`,q:{en:`Where is the problem?`,hi:`Problem kahan hai?`},o:[{en:`The RADIUS secret on the switch`,hi:`Switch par RADIUS secret`},{en:`The VLAN STAFF is missing`,hi:`VLAN STAFF missing hai`},{en:`The route to the server`,hi:`Server tak route`},{en:`The credentials stored on Kabir's laptop`,hi:`Kabir ke laptop mein saved credentials`}],a:3,w:{en:`The server answers (reject) and names the reason: wrong password. Path and secret are fine because other users pass. Correct the saved password and clear the interface.`,hi:`Server jawab deta hai (reject) aur reason batata hai: wrong password. Path aur secret theek hain kyunki doosre users pass hote hain. Saved password theek karo aur interface clear karo.`}},{title:{en:`The guest printer`,hi:`Guest printer`},ticket:{en:`Printer PRN1 cannot do 802.1X. About a minute after the ge-0/0/3 configuration it appears like this.`,hi:`Printer PRN1 802.1X nahi kar sakta. ge-0/0/3 configuration ke kareeb ek minute baad yeh aisa dikhta hai.`},out:`lab@FLOOR3> show dot1x interface ge-0/0/3 detail
  Guest VLAN member:                    GUEST
    Supplicant: unknown, 00:1b:a9:44:10:07
      Operational state:                Authenticated
      Authentication method:            Guest VLAN
      Authenticated VLAN:               GUEST
      802.1X / MAC RADIUS / portal:     No response / Not run / Not run`,q:{en:`Why did the printer wait about a minute?`,hi:`Printer kareeb ek minute kyun ruka?`},o:[{en:`RADIUS was down`,hi:`RADIUS down tha`},{en:`The switch sent EAP-Request/Identity maximum-requests times, 30 seconds apart, before using the guest VLAN`,hi:`Switch ne guest VLAN se pehle EAP-Request/Identity maximum-requests baar, 30 second ke gap se bheja`},{en:`The reauthentication timer is 3600 s`,hi:`Reauthentication timer 3600 s hai`},{en:`The MAC was not registered`,hi:`MAC registered nahi tha`}],a:1,w:{en:`The guest VLAN is used only after the EAPOL requests go unanswered: 2 x 30 s by default. The last line "No response" confirms it.`,hi:`Guest VLAN tabhi use hota hai jab EAPOL requests unanswered rahein: default 2 x 30 s. Aakhri line "No response" ise confirm karti hai.`}},{title:{en:`RADIUS crashed: who still works?`,hi:`RADIUS crash hua: kaun chal raha hai?`},ticket:{en:`NKRAD2 was stopped. ANIL on ge-0/0/1 had to log in again. Read the output.`,hi:`NKRAD2 stop kiya gaya. ge-0/0/1 par ANIL ko dobara login karna pada. Output padho.`},out:`lab@LABSW> show dot1x interface ge-0/0/1 detail
  Supplicant mode:                      Single-Secure
  Server fail action:                   permit
    Supplicant: anil, 00:50:cc:5f:57:01
      Operational state:                Authenticated
      Authentication method:            Server Fail
      Authenticated VLAN:               STAFF
      802.1X / MAC RADIUS / portal:     Server timeout / Not run / Not run`,q:{en:`Why is Anil authorised?`,hi:`Anil authorised kyun hai?`},o:[{en:`RADIUS accepted him from its cache`,hi:`RADIUS ne use apne cache se accept kiya`},{en:`server-fail permit authorised him in the port's own VLAN after the server timed out`,hi:`Server timeout hone ke baad server-fail permit ne use port ke apne VLAN mein authorise kiya`},{en:`The guest VLAN caught him`,hi:`Guest VLAN ne use pakda`},{en:`MAC RADIUS accepted his MAC`,hi:`MAC RADIUS ne uska MAC accept kiya`}],a:1,w:{en:`"Server Fail" is the method and "Server timeout" the 802.1X result. With permit, the host gets the port VLAN. Default deny would have kept him out.`,hi:`"Server Fail" method hai aur "Server timeout" 802.1X ka result. Permit ke saath host ko port ka VLAN milta hai. Default deny use bahar rakhta.`}},{title:{en:`Which user name reached RADIUS?`,hi:`RADIUS tak kaunsa user name pahuncha?`},ticket:{en:`A label printer with MAC 00:1b:a9:52:00:0c gets into the PRINTERS VLAN. Read the server log.`,hi:`MAC 00:1b:a9:52:00:0c wala label printer PRINTERS VLAN mein aa jaata hai. Server log padho.`},out:`lab@LABSW> show dot1x interface ge-0/0/2 detail
      Authentication method:            Mac Radius
      Authenticated VLAN:               PRINTERS (assigned by RADIUS)
      802.1X / MAC RADIUS / portal:     No response / Authenticated / Not run

NKRAD2> aaa-server show log
Recent events:
  MAC RADIUS PASS for 001ba952000c (NAS 10.44.50.1, ge-0/0/2)`,q:{en:`What does the log tell you about MAC RADIUS?`,hi:`Log MAC RADIUS ke baare mein kya batata hai?`},o:[{en:`A fixed word "mab" is used`,hi:`Ek fixed shabd "mab" use hota hai`},{en:`The user name is the port name`,hi:`User name port ka naam hai`},{en:`The switch name is used`,hi:`Switch ka naam use hota hai`},{en:`The user name is the MAC address without separators`,hi:`User name bina separators ka MAC address hai`}],a:3,w:{en:`MAC RADIUS sends the 12 hex digits as user name (and password). The 802.1X phase had no response, then MAC RADIUS passed.`,hi:`MAC RADIUS 12 hex digits ko user name (aur password) ki tarah bhejta hai. 802.1X phase mein response nahi aaya, phir MAC RADIUS pass hua.`}},{title:{en:`The visitor in the meeting room`,hi:`Meeting room ka visitor`},ticket:{en:`A visitor with account guest01 reaches the internet VLAN only. Read the output.`,hi:`Account guest01 wala visitor sirf internet VLAN tak pahunchta hai. Output padho.`},out:`lab@LABSW> show captive-portal interface
Interface     Role           State           MAC address          User
ge-0/0/3.0    Authenticator  Authenticated   00:50:f1:30:a6:01    guest01

lab@LABSW> show dot1x interface ge-0/0/3 detail
  Authentication methods:               802.1X, captive portal
      Authentication method:            Captive Portal
      Authenticated VLAN:               GUEST (assigned by RADIUS)
      802.1X / MAC RADIUS / portal:     No response / Not run / Authenticated`,q:{en:`How was the visitor authenticated?`,hi:`Visitor ko kaise authenticate kiya gaya?`},o:[{en:`By web login on the captive portal, checked by RADIUS, which assigned GUEST`,hi:`Captive portal par web login se, jise RADIUS ne check kiya aur GUEST assign kiya`},{en:`By MAC RADIUS`,hi:`MAC RADIUS se`},{en:`By the guest VLAN fallback`,hi:`Guest VLAN fallback se`},{en:`By 802.1X with a certificate`,hi:`802.1X se certificate ke saath`}],a:0,w:{en:`802.1X got no response, MAC RADIUS did not run, and the portal login succeeded. RADIUS returned the VLAN GUEST.`,hi:`802.1X ko response nahi mila, MAC RADIUS nahi chala, aur portal login succeed hua. RADIUS ne VLAN GUEST return kiya.`}}];export{e as default};