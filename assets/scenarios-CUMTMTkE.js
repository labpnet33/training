var e=[{title:{en:`Everyone offline after the weekend`,hi:`Weekend ke baad sab offline`},ticket:{en:`Monday 08:05: "Nobody on floor 3 can log in, printers too." A change was made on SW1 on Saturday. ISE is up and other switches work. You read the RADIUS server log.`,hi:`Somvaar 08:05: "Floor 3 par koi login nahi kar pa raha, printers bhi nahi." Shanivaar ko SW1 par change hua tha. ISE up hai aur baaki switches chal rahe hain. Aap RADIUS server log padhte ho.`},out:`ISE> aaa-server show log
Sep 30 08:02:11.482  RADIUS request from 10.99.99.1 ignored: shared key mismatch
Sep 30 08:02:26.517  RADIUS request from 10.99.99.1 ignored: shared key mismatch

SW1# show aaa servers
RADIUS: id 1, priority 1, host 10.99.99.10, auth-port 1812, acct-port 1813, hostname ISE
     State: current DEAD, duration 94s, previous duration 0s
     Authen: request 4, timeouts 4, failover 0, retransmission 0
             Response: accept 0, reject 0, challenge 0`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`UDP 1812 is blocked between SW1 and ISE`,hi:`SW1 aur ISE ke beech UDP 1812 blocked hai`},{en:`The RADIUS key on SW1 does not match the key ISE has for 10.99.99.1`,hi:`SW1 ki RADIUS key 10.99.99.1 ke liye ISE ki key se match nahi karti`},{en:`The users' passwords expired over the weekend`,hi:`Weekend par users ke passwords expire ho gaye`},{en:`SW1 is not registered in ISE as a network device`,hi:`SW1 ISE mein network device ki tarah registered nahi hai`}],a:1,w:{en:`ISE receives the requests (so the path is fine) and knows 10.99.99.1 (otherwise the log would say "unknown network device"), but the key does not match, so it drops them silently. The switch sees only timeouts and marks the server DEAD. Fix the key under "radius server ISE". Expired passwords would produce Access-Reject, not timeouts.`,hi:`ISE requests receive karta hai (to path theek hai) aur 10.99.99.1 ko jaanta hai (warna log "unknown network device" kehta), lekin key match nahi karti, isliye woh unhe chupchaap drop karta hai. Switch sirf timeouts dekhta hai aur server ko DEAD mark karta hai. "radius server ISE" ke neeche key theek karo. Expired passwords Access-Reject dete, timeouts nahi.`}},{title:{en:`The supplicant that is never asked`,hi:`Supplicant jisse kabhi poocha hi nahi jaata`},ticket:{en:`The RADIUS key has been fixed and the printer on Gi0/2 now works. PC1 has a correctly configured supplicant (alice), but is still not getting access on Gi0/1.`,hi:`RADIUS key theek ho gayi hai aur Gi0/2 wala printer ab chal raha hai. PC1 ka supplicant (alice) sahi configured hai, lekin Gi0/1 par abhi bhi access nahi mil raha.`},out:`SW1# show authentication sessions interface g0/1 details
            Interface:  GigabitEthernet0/1
          MAC Address:  0050.7966.0101
            User-Name:  005079660101
               Status:  Unauthorized
Method status list:
       Method           State
       dot1x            Not run
       mab              Authc Failed

SW1# show dot1x all
Sysauthcontrol              Disabled
Dot1x Protocol Version            3`,q:{en:`What should you configure?`,hi:`Aapko kya configure karna chahiye?`},o:[{en:`Add PC1's MAC to the MAB endpoint list on ISE`,hi:`ISE par MAB endpoint list mein PC1 ka MAC jodo`},{en:`dot1x timeout tx-period 5 on Gi0/1`,hi:`Gi0/1 par dot1x timeout tx-period 5`},{en:`authentication order mab dot1x on Gi0/1`,hi:`Gi0/1 par authentication order mab dot1x`},{en:`dot1x system-auth-control`,hi:`dot1x system-auth-control`}],a:3,w:{en:`"Not run" (not "No response") means the switch never sent EAP-Request/Identity, because 802.1X is disabled globally (Sysauthcontrol Disabled). The switch skipped to MAB, which failed because PC1 is not a MAB endpoint. Adding the MAC would bypass 802.1X for an employee laptop, which is the wrong fix.`,hi:`"Not run" ("No response" nahi) ka matlab hai switch ne kabhi EAP-Request/Identity bheja hi nahi, kyunki 802.1X globally disabled hai (Sysauthcontrol Disabled). Switch seedha MAB par gaya, jo fail hua kyunki PC1 MAB endpoint nahi hai. MAC jodna employee laptop ke liye 802.1X bypass kar deta, jo galat fix hai.`}},{title:{en:`Authenticated, but in the wrong network`,hi:`Authenticated, lekin galat network mein`},ticket:{en:`alice now authenticates and ISE logs "802.1X (EAP-MD5) PASS for alice". Her laptop gets 10.10.10.23 and cannot reach the employee file server. ISE is configured to return VLAN 20 and SGT 10.`,hi:`alice ab authenticate hoti hai aur ISE "802.1X (EAP-MD5) PASS for alice" log karta hai. Uske laptop ko 10.10.10.23 milta hai aur woh employee file server tak nahi pahunch pata. ISE VLAN 20 aur SGT 10 return karne ke liye configured hai.`},out:`SW1# show authentication sessions interface g0/1 details
            Interface:  GigabitEthernet0/1
            User-Name:  alice
               Status:  Authorized
Local Policies:
           Vlan Group:  Vlan: 10  (port access VLAN)
Method status list:
       Method           State
       dot1x            Authc Success

SW1# show running-config | include ^aaa
aaa new-model
aaa authentication dot1x default group radius`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`aaa authorization network default group radius`,hi:`aaa authorization network default group radius`},{en:`VLAN 20 on SW1`,hi:`SW1 par VLAN 20`},{en:`aaa accounting dot1x default start-stop group radius`,hi:`aaa accounting dot1x default start-stop group radius`},{en:`authentication host-mode multi-auth`,hi:`authentication host-mode multi-auth`}],a:0,w:{en:`There is no "Server Policies" section: the switch received VLAN 20 and SGT 10 but ignored them because no network authorization list exists. If VLAN 20 were missing, the session would fail with "VLAN not found" instead of being authorized in VLAN 10. Accounting does not affect authorization.`,hi:`"Server Policies" section nahi hai: switch ko VLAN 20 aur SGT 10 mile lekin network authorization list na hone se usne unhe ignore kiya. Agar VLAN 20 missing hota, to session VLAN 10 mein authorize hone ki jagah "VLAN not found" se fail hota. Accounting authorization ko affect nahi karta.`}},{title:{en:`The slow printer`,hi:`Dheema printer`},ticket:{en:`Facilities: "After every power cut the label printers on the warehouse switch take a minute and a half to come back, and some never get an address until someone reboots them." Ports use order dot1x mab.`,hi:`Facilities: "Har power cut ke baad warehouse switch ke label printers ko wapas aane mein dedh minute lagta hai, aur kuch ko tab tak address nahi milta jab tak koi unhe reboot na kare." Ports order dot1x mab use karte hain.`},out:`SW3# show dot1x interface g1/0/14
Dot1x Info for GigabitEthernet1/0/14
------------------------------------
PAE                       = AUTHENTICATOR
QuietPeriod               = 60
ServerTimeout             = 0
SuppTimeout               = 30
ReAuthMax                 = 2
MaxReq                    = 2
TxPeriod                  = 30

%AUTHMGR-7-FAILOVER: Failing over from 'dot1x' for client (0050.7a00.0e41) on Interface GigabitEthernet1/0/14`,q:{en:`What is the best change?`,hi:`Sabse achha change kya hai?`},o:[{en:`Increase quiet-period so the printer retries less often`,hi:`quiet-period badhao taaki printer kam retry kare`},{en:`Change host mode to multi-host`,hi:`Host mode multi-host karo`},{en:`Reduce tx-period (for example 5 s), or use order mab dot1x with priority dot1x mab`,hi:`tx-period kam karo (jaise 5 s), ya priority dot1x mab ke saath order mab dot1x use karo`},{en:`Configure a critical VLAN`,hi:`Critical VLAN configure karo`}],a:2,w:{en:`With TxPeriod 30 and ReAuthMax 2 the switch waits 30 x (2 + 1) = 90 s before failing over to MAB. Shortening tx-period to 5 s gives 15 s; running MAB first with 802.1X at higher priority makes printers almost instant. Quiet-period applies after a failure, and a critical VLAN is only for dead servers.`,hi:`TxPeriod 30 aur ReAuthMax 2 ke saath switch MAB par failover se pehle 30 x (2 + 1) = 90 s wait karta hai. tx-period 5 s karne se 15 s; higher priority 802.1X ke saath pehle MAB chalane se printers lagbhag turant aate hain. Quiet-period failure ke baad lagta hai, aur critical VLAN sirf dead servers ke liye hai.`}},{title:{en:`Phones work, PCs do not`,hi:`Phones chalte hain, PCs nahi`},ticket:{en:`After a switch refresh on floor 5, IP phones register but the PCs plugged into the phones' PC ports have no network. Both phone and PC are known to ISE.`,hi:`Floor 5 par switch refresh ke baad IP phones register ho jaate hain lekin phones ke PC ports mein lage PCs ko network nahi milta. Phone aur PC dono ISE ko pata hain.`},out:`SW5# show authentication sessions interface g1/0/8
Interface                MAC Address    Method  Domain  Status Fg  Session ID
--------------------------------------------------------------------------------------------
Gi1/0/8                  0050.7a10.2201 mab     VOICE   Auth      0A0A0505000001A2

%AUTHMGR-5-SECURITY_VIOLATION: Security violation on the interface GigabitEthernet1/0/8, new MAC address (0050.7966.1a0b) is seen.

SW5# show running-config interface g1/0/8 | include host-mode
(no output)`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Add authentication open to the port`,hi:`Port par authentication open jodo`},{en:`authentication violation shutdown`,hi:`authentication violation shutdown`},{en:`authentication host-mode multi-domain`,hi:`authentication host-mode multi-domain`},{en:`Remove mab from the port`,hi:`Port se mab hatao`}],a:2,w:{en:`No host-mode line means the default single-host: the phone's MAC was authorized first, so the PC's MAC is a second MAC and a security violation. Multi-domain allows one voice and one data device, each authenticated. Open mode would hide the problem and remove enforcement.`,hi:`Host-mode line na hone ka matlab default single-host: phone ka MAC pehle authorize hua, isliye PC ka MAC doosra MAC aur security violation hai. Multi-domain ek voice aur ek data device allow karta hai, dono authenticated. Open mode problem chhupa deta aur enforcement hata deta.`}},{title:{en:`Guests locked out completely`,hi:`Guests poori tarah bahar`},ticket:{en:`A new access switch was configured from a template. Visitors' laptops (no supplicant, unknown MACs) should land in guest VLAN 50 but stay without any network. Employees work fine.`,hi:`Ek naya access switch template se configure hua. Visitors ke laptops (bina supplicant, unknown MACs) ko guest VLAN 50 mein jaana chahiye lekin woh bina network ke rehte hain. Employees theek chal rahe hain.`},out:`SW4# show authentication sessions interface g1/0/3 details
            Interface:  GigabitEthernet1/0/3
          MAC Address:  0050.7966.0c77
               Status:  Unauthorized
Failure reason: VLAN 50 does not exist

Method status list:
       Method           State
       dot1x            No response
       mab              Authc Failed

%AUTHMGR-5-FAIL: Authorization failed or unapplied for client (0050.7966.0c77) on Interface GigabitEthernet1/0/3 (VLAN 50 not found)`,q:{en:`What should you do?`,hi:`Aapko kya karna chahiye?`},o:[{en:`Create VLAN 50 on SW4 (and allow it on the uplink with its gateway)`,hi:`SW4 par VLAN 50 banao (aur use gateway ke saath uplink par allow karo)`},{en:`Add the visitor MAC addresses to ISE`,hi:`Visitor MAC addresses ISE mein jodo`},{en:`Configure authentication event fail action authorize vlan 50`,hi:`authentication event fail action authorize vlan 50 configure karo`},{en:`Increase tx-period`,hi:`tx-period badhao`}],a:0,w:{en:`The logic worked: no 802.1X response, MAB failed, so the no-response rule tried to authorize VLAN 50, but that VLAN does not exist on this switch, so the port stays closed. Every fallback VLAN (guest, auth-fail, critical) must exist. The fail action is for 802.1X rejects, which did not happen here.`,hi:`Logic ne kaam kiya: 802.1X ka jawab nahi, MAB fail, to no-response rule ne VLAN 50 authorize karne ki koshish ki, lekin woh VLAN is switch par exist nahi karta, isliye port band rehta hai. Har fallback VLAN (guest, auth-fail, critical) exist karna chahiye. Fail action 802.1X rejects ke liye hai, jo yahan nahi hua.`}},{title:{en:`The guest portal that changes nothing`,hi:`Guest portal jo kuch nahi badalta`},ticket:{en:`Central WebAuth: guests are redirected to the ISE portal and log in successfully, but stay stuck with the redirect and never get internet access. ISE Live Logs show "CoA request sent" with no response.`,hi:`Central WebAuth: guests ISE portal par redirect hote hain aur successfully login karte hain, lekin redirect ke saath atke rehte hain aur kabhi internet access nahi milta. ISE Live Logs "CoA request sent" dikhate hain bina response ke.`},out:`SW2# show running-config | section radius
radius server ISE
 address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
 key NKsecret

SW2# show running-config | section dynamic-author
(no output)

SW2# show authentication sessions interface g1/0/21 details
               Status:  Authorized
     URL Redirect ACL:  REDIRECT-ACL
         URL Redirect:  (ISE guest portal)`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`The redirect ACL does not deny DNS`,hi:`Redirect ACL DNS ko deny nahi karta`},{en:`The switch needs Local WebAuth instead`,hi:`Switch ko iski jagah Local WebAuth chahiye`},{en:`The guest VLAN is missing`,hi:`Guest VLAN missing hai`},{en:`The switch does not accept CoA: aaa server radius dynamic-author is not configured`,hi:`Switch CoA accept nahi karta: aaa server radius dynamic-author configured nahi hai`}],a:3,w:{en:`The portal loads and the login succeeds, so redirection and DNS work. The final step of CWA is a CoA reauthenticate from ISE to the switch (UDP 1700). Without "aaa server radius dynamic-author" and "client 10.99.99.10 server-key ...", the switch ignores it and the session keeps its redirect authorization.`,hi:`Portal load hota hai aur login succeed hota hai, to redirection aur DNS kaam kar rahe hain. CWA ka aakhri step ISE se switch ko CoA reauthenticate hai (UDP 1700). "aaa server radius dynamic-author" aur "client 10.99.99.10 server-key ..." ke bina switch use ignore karta hai aur session apna redirect authorization rakhta hai.`}},{title:{en:`Guests can still print`,hi:`Guests abhi bhi print kar sakte hain`},ticket:{en:`Policy says the Guest group (SGT 50) must not reach Printers (SGT 30). An engineer configured a role-based ACL on SW1, but a test from a tagged guest still reaches the printer.`,hi:`Policy kehti hai Guest group (SGT 50) Printers (SGT 30) tak nahi pahunchna chahiye. Engineer ne SW1 par role-based ACL configure kiya, lekin tagged guest se test abhi bhi printer tak pahunchta hai.`},out:`SW1# show cts role-based permissions
IPv4 Role-based permissions from group 50 to group 30 (configured):
	NO-PRINT
	    deny ip
RBACL Monitor All for Configured Policies : FALSE
Enforcement: DISABLED (cts role-based enforcement is not configured)

SW1# show cts role-based sgt-map all
IP Address              SGT     Source
============================================
10.30.30.10             30      LOCAL
10.50.50.12             50      LOCAL`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Configure SXP towards the printer`,hi:`Printer ki taraf SXP configure karo`},{en:`Enable cts role-based enforcement`,hi:`cts role-based enforcement enable karo`},{en:`Swap the matrix to "from 30 to 50"`,hi:`Matrix ko "from 30 to 50" mein badlo`},{en:`Add a static sgt-map for the guest`,hi:`Guest ke liye static sgt-map jodo`}],a:1,w:{en:`Classification is correct (both bindings exist) and the matrix cell from 50 to 30 is correct, but enforcement is disabled, so SGACLs are not applied. Enable "cts role-based enforcement". The direction "from source to destination" is already right, and SXP is only needed to share bindings with devices that do not have them.`,hi:`Classification sahi hai (dono bindings maujood hain) aur 50 se 30 ka matrix cell sahi hai, lekin enforcement disabled hai, isliye SGACLs apply nahi hote. "cts role-based enforcement" enable karo. "Source se destination" direction pehle se sahi hai, aur SXP sirf un devices ke saath bindings share karne ke liye chahiye jinke paas woh nahi hain.`}}];export{e as default};