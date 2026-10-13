var e=[{title:{en:`Discovery finds everything but manages nothing`,hi:`Discovery sab dhoondhta hai par manage kuch nahi karta`},ticket:{en:`A new engineer ran discovery on the Pune management VLAN. All three switches answered but none became Managed. The switches were deployed last week with the standard baseline.`,hi:`Ek naye engineer ne Pune management VLAN par discovery chalaya. Teeno switches ne jawab diya par koi Managed nahi bana. Switches pichhle hafte standard baseline ke saath deploy hue the.`},out:`CTRL> center discover 10.99.0.0/24 cli netadmin wrongpass snmp nkro
Discovery job 1: 10.99.0.0/24 (254 addresses)  CLI user netadmin  SNMP community nkro
IP address  Device  ICMP  SNMP  SSH   Result
----------  ------  ----  ----  ----  -------------------------------
10.99.0.1   DSW1    ok    ok    fail  CLI (SSH) authentication failed
10.99.0.11  ASW1    ok    ok    fail  CLI (SSH) authentication failed
10.99.0.12  ASW2    ok    ok    fail  CLI (SSH) authentication failed
Scan complete: 0 managed, 3 failed, 251 addresses did not respond.`,q:{en:`What is the most likely cause and fix?`,hi:`Sabse sambhavit cause aur fix kya hai?`},o:[{en:`The management VLAN has no route to the controller; add a default gateway`,hi:`Management VLAN ka controller tak route nahi; default gateway jodo`},{en:`The SNMP community is wrong; change it to public`,hi:`SNMP community galat hai; ise public karo`},{en:`The CLI password is wrong; re-run discovery with the correct netadmin secret`,hi:`CLI password galat hai; sahi netadmin secret ke saath discovery dobara chalao`},{en:`The switches need NETCONF enabled before SSH works`,hi:`SSH chalne se pehle switches par NETCONF enable hona chahiye`}],a:2,w:{en:`ICMP and SNMP succeed, so routing and the community are fine. Only the SSH stage fails on every switch, and the job shows the password typed as "wrongpass". Re-run with NK@dmin1 (or fix login local / transport input ssh if the password is right).`,hi:`ICMP aur SNMP succeed hote hain, isliye routing aur community theek hain. Har switch par sirf SSH stage fail hota hai, aur job mein password "wrongpass" type kiya dikhta hai. NK@dmin1 ke saath dobara chalao (ya password sahi ho to login local / transport input ssh theek karo).`}},{title:{en:`SSH works, SNMP does not`,hi:`SSH chalta hai, SNMP nahi`},ticket:{en:`A contractor copied discovery settings from another customer's runbook. The job reports failures on every switch even though the engineer can SSH to all of them.`,hi:`Ek contractor ne discovery settings kisi aur customer ki runbook se copy ki. Engineer sab switches par SSH kar sakta hai phir bhi job har switch par failure report karta hai.`},out:`CTRL> center discover 10.99.0.1-20 cli netadmin NK@dmin1 snmp public
Discovery job 2: 10.99.0.1-20 (20 addresses)  CLI user netadmin  SNMP community public
IP address  Device  ICMP  SNMP  SSH  Result
----------  ------  ----  ----  ---  ------------------------------
10.99.0.1   DSW1    ok    fail  ok   SNMP timeout / wrong community
10.99.0.11  ASW1    ok    fail  ok   SNMP timeout / wrong community
10.99.0.12  ASW2    ok    fail  ok   SNMP timeout / wrong community

ASW1# show running-config | include snmp
snmp-server community nkro RO`,q:{en:`What should be changed?`,hi:`Kya badalna chahiye?`},o:[{en:`Use the site's read community nkro in the discovery credentials`,hi:`Discovery credentials mein site ki read community nkro use karo`},{en:`Add snmp-server community public RW on every switch`,hi:`Har switch par snmp-server community public RW jodo`},{en:`Change the range to 10.99.0.0/24 so more addresses are scanned`,hi:`Range ko 10.99.0.0/24 karo taaki zyada addresses scan hon`},{en:`Reset the SSH password because SSH must fail for SNMP to work`,hi:`SSH password reset karo kyunki SNMP chalne ke liye SSH fail hona chahiye`}],a:0,w:{en:`The switches are configured with community nkro, the job used public. Fix the controller credential rather than adding a well-known RW community to devices, which would be a security hole.`,hi:`Switches par community nkro configure hai, job ne public use kiya. Devices par well-known RW community jodne ki jagah controller credential theek karo, warna security hole ban jaayega.`}},{title:{en:`P1 routing issue after a change`,hi:`Change ke baad P1 routing issue`},ticket:{en:`Staff in VLAN 20 cannot reach anything in the data centre. Assurance shows a P1 on DSW1. R1 was reconfigured last night.`,hi:`VLAN 20 ka staff data centre mein kuch bhi nahi pahunch pa raha. Assurance DSW1 par P1 dikhata hai. R1 kal raat reconfigure hua tha.`},out:`CTRL> center issues #2B80
Issue #2B80  [P1]  Routing
  OSPF adjacency down on Gi0/3 toward R1
Description:
  OSPF is enabled on DSW1 GigabitEthernet0/3 and a neighbour (R1 10.0.0.1) is on the segment, but no FULL
  adjacency exists. Likely cause: area mismatch: DSW1 uses area 0, hellos from R1 carry area 1.
Impacted: DSW1, R1

CTRL> center events 3
19:29:50  DSW1     %OSPF-4-ERRRCV          Received invalid packet: mismatched area ID 1 (local area 0) from 10.0.0.1, GigabitEthernet0/3

R1# show ip ospf interface GigabitEthernet0/0 | include Area
  Internet Address 10.0.0.1/30, Interface ID 1, Area 1`,q:{en:`Which fix restores the adjacency correctly?`,hi:`Kaunsa fix adjacency ko sahi tarah wapas laata hai?`},o:[{en:`On DSW1, move Gi0/3 into area 1 to match R1`,hi:`DSW1 par Gi0/3 ko R1 se match karne ke liye area 1 mein daalo`},{en:`Make Gi0/3 on DSW1 passive so it stops logging errors`,hi:`DSW1 par Gi0/3 ko passive karo taaki errors log hona band ho`},{en:`Re-discover R1 so the controller clears the issue`,hi:`R1 ko dobara discover karo taaki controller issue clear kare`},{en:`On R1, replace network 10.0.0.0 0.0.0.3 area 1 with area 0`,hi:`R1 par network 10.0.0.0 0.0.0.3 area 1 ko area 0 se badlo`}],a:3,w:{en:`The transit link to the distribution layer belongs in area 0; R1 is the side that changed. Moving DSW1's side to area 1 would split area 0 (R1's server subnet and DSW1's user VLANs are both area 0), and passive or re-discovery does not fix the mismatch. After the fix DSW1 shows R1 FULL and learns 172.16.50.0/24.`,hi:`Distribution layer tak ka transit link area 0 mein hona chahiye; R1 woh side hai jo badli. DSW1 ki side ko area 1 mein daalna area 0 ko split kar dega (R1 ka server subnet aur DSW1 ke user VLANs dono area 0 mein hain), aur passive ya re-discovery mismatch theek nahi karte. Fix ke baad DSW1 R1 ko FULL dikhata hai aur 172.16.50.0/24 seekhta hai.`}},{title:{en:`A PC is offline behind an access port`,hi:`Access port ke peeche ek PC offline`},ticket:{en:`PC1 lost network access after someone "hardened" ASW1 last week. Assurance shows a P1 client issue and a P2 on ASW1.`,hi:`Pichhle hafte kisi ne ASW1 ko "harden" kiya, uske baad PC1 ka network chala gaya. Assurance ek P1 client issue aur ASW1 par P2 dikhata hai.`},out:`CTRL> center health PC1
Client PC1  health 1/10 (Poor)
  IP 10.10.10.21/24  gateway 10.10.10.1 NOT reachable  DNS 172.16.50.10
  Connected to ASW1 GigabitEthernet0/3 vlan 10
  P1  PC1 cannot reach its gateway 10.10.10.1

ASW1# show port-security interface GigabitEthernet0/3
Port Security              : Enabled
Port Status                : Secure-shutdown
Violation Mode             : Shutdown
Maximum MAC Addresses      : 1
Configured MAC Addresses   : 1
Last Source Address:Vlan   : 0050.7f06.6d01:10
Security Violation Count   : 1

ASW1# show running-config interface GigabitEthernet0/3 | include mac-address
 switchport port-security mac-address 0050.7966.aaaa`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Disable port-security on Gi0/3 permanently`,hi:`Gi0/3 par port-security hamesha ke liye disable karo`},{en:`Remove the wrong static secure MAC 0050.7966.aaaa, then shutdown / no shutdown the port`,hi:`Galat static secure MAC 0050.7966.aaaa hatao, phir port ko shutdown / no shutdown karo`},{en:`Change PC1's default gateway to 10.10.10.254`,hi:`PC1 ka default gateway 10.10.10.254 karo`},{en:`Move PC1 to VLAN 20 on ASW2`,hi:`PC1 ko ASW2 par VLAN 20 mein le jao`}],a:1,w:{en:`The configured secure MAC is not PC1's MAC (0050.7f06.6d01), so the first frame caused a violation and the port went secure-shutdown (err-disabled). Removing the wrong entry keeps port-security in place; the bounce clears the err-disabled state and both issues resolve.`,hi:`Configured secure MAC PC1 ka MAC (0050.7f06.6d01) nahi hai, isliye pehle frame ne violation kiya aur port secure-shutdown (err-disabled) ho gaya. Galat entry hatane se port-security bani rehti hai; bounce err-disabled state clear karta hai aur dono issues resolve ho jaate hain.`}},{title:{en:`Ping works, the web app does not`,hi:`Ping chalta hai, web app nahi`},ticket:{en:`Staff on VLAN 20 say the intranet web app on SRV never loads. The dashboard is green and the helpdesk confirmed PC2 can ping SRV.`,hi:`VLAN 20 ka staff kehta hai SRV par intranet web app kabhi load nahi hota. Dashboard green hai aur helpdesk ne confirm kiya ki PC2 SRV ko ping kar sakta hai.`},out:`CTRL> center pathtrace PC2 SRV tcp 80
Path trace 2: PC2 (10.20.20.22) -> SRV (172.16.50.10)  protocol TCP port 80

Forward path:
   1  PC2       pc         out eth0
   2  ASW2      L2 switch  in Gi0/3, out Gi0/0
   3  DSW1      l3switch   in Vl20 (Gi0/2), out Gi0/3
   4  R1        router     in Gi0/0   X DROPPED: Denied by access list WAN-IN (in on Gi0/0)

Result: FAILED
Break point: R1 - Denied by access list WAN-IN (in on Gi0/0)

R1# show access-lists WAN-IN
Extended IP access list WAN-IN
    10 deny tcp 10.20.20.0 0.0.0.255 host 172.16.50.10 eq www
    20 permit ip any any (3 matches)`,q:{en:`What is the best fix that keeps the security policy?`,hi:`Security policy bachaate hue sabse accha fix kya hai?`},o:[{en:`no ip access-group WAN-IN in on R1 Gi0/0`,hi:`R1 Gi0/0 par no ip access-group WAN-IN in`},{en:`Add a static route on DSW1 for 172.16.50.0/24`,hi:`DSW1 par 172.16.50.0/24 ka static route jodo`},{en:`In WAN-IN, remove only sequence 10 and re-run the TCP 80 trace`,hi:`WAN-IN mein sirf sequence 10 hatao aur TCP 80 trace dobara chalao`},{en:`Move PC2 to VLAN 10 so it is not matched by the ACL`,hi:`PC2 ko VLAN 10 mein le jao taaki ACL match na kare`}],a:2,w:{en:`The trace names the device, ACL, interface and direction. Removing sequence 10 keeps WAN-IN applied inbound for everything else; the re-run shows COMPLETED with TCP 80 open. Removing the ACL from the interface or moving users are over-reactions.`,hi:`Trace device, ACL, interface aur direction ka naam deta hai. Sequence 10 hatane se WAN-IN baaki sab ke liye inbound laga rehta hai; dobara chalane par COMPLETED aur TCP 80 open dikhta hai. Interface se ACL hatana ya users ko move karna zaroorat se zyada reaction hai.`}},{title:{en:`Compliance turns red overnight`,hi:`Raat mein compliance laal ho gaya`},ticket:{en:`The morning compliance report shows one switch out of standard. A night-shift engineer worked on ASW2 during an incident.`,hi:`Subah ki compliance report ek switch ko standard se bahar dikhati hai. Night-shift engineer ne ek incident ke dauraan ASW2 par kaam kiya tha.`},out:`CTRL> center compliance
Template         Device  Status
---------------  ------  -------------
NTP-Baseline     DSW1    COMPLIANT
NTP-Baseline     ASW1    COMPLIANT
NTP-Baseline     ASW2    COMPLIANT
Banner-Standard  DSW1    COMPLIANT
Banner-Standard  ASW1    COMPLIANT
Banner-Standard  ASW2    NON_COMPLIANT
ASW2 is missing (Banner-Standard):
    banner motd #Authorised access only - Pune_Campus#`,q:{en:`What should the engineer do?`,hi:`Engineer ko kya karna chahiye?`},o:[{en:`Re-deploy Banner-Standard to ASW2 with site=Pune_Campus and re-check compliance`,hi:`ASW2 par site=Pune_Campus ke saath Banner-Standard dobara deploy karo aur compliance dobara check karo`},{en:`Delete the Banner-Standard template so the report is clean`,hi:`Banner-Standard template delete karo taaki report saaf ho`},{en:`Re-discover ASW2; compliance resets after discovery`,hi:`ASW2 ko dobara discover karo; discovery ke baad compliance reset hota hai`},{en:`Reload ASW2 so the startup config is used`,hi:`ASW2 reload karo taaki startup config use ho`}],a:0,w:{en:`Compliance tells you exactly which line is missing on which device. Re-deploying the template to ASW2 restores the banner and returns it to COMPLIANT; also review why the line was removed during the incident.`,hi:`Compliance exactly batata hai ki kaunse device par kaunsi line missing hai. ASW2 par template dobara deploy karne se banner wapas aata hai aur woh COMPLIANT ho jaata hai; yeh bhi review karo ki incident ke dauraan line kyun hatayi gayi.`}},{title:{en:`Automation script fails after an hour`,hi:`Automation script ek ghante baad fail hoti hai`},ticket:{en:`A script that posts new P1 issues to the team chat works after start-up, then fails every call from about an hour later.`,hi:`Ek script jo naye P1 issues team chat par post karti hai, start-up ke baad chalti hai, phir lagbhag ek ghante baad har call fail karti hai.`},out:`09:00:02  POST /dna/system/api/v1/auth/token        -> 200 OK
09:00:03  GET  /dna/intent/api/v1/issues?priority=P1 -> 200 OK   (0 issues)
09:55:03  GET  /dna/intent/api/v1/issues?priority=P1 -> 200 OK   (1 issue)
10:05:03  GET  /dna/intent/api/v1/issues?priority=P1 -> 401 Unauthorized
10:10:03  GET  /dna/intent/api/v1/issues?priority=P1 -> 401 Unauthorized`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The service account lacks permission to read issues`,hi:`Service account ko issues padhne ki permission nahi`},{en:`The issues path does not exist in this release`,hi:`Is release mein issues path exist nahi karta`},{en:`The controller is overloaded and returning server errors`,hi:`Controller overloaded hai aur server errors de raha hai`},{en:`The token expired; the script must request a new token when it gets 401 and retry`,hi:`Token expire ho gaya; 401 milne par script ko naya token maang kar retry karna chahiye`}],a:3,w:{en:`The same call worked for an hour, so the path and permissions are fine (those would be 404 and 403 from the start). 401 means not authenticated: the token is about an hour old. Server errors would be 5xx.`,hi:`Wahi call ek ghanta chali, isliye path aur permissions theek hain (woh shuru se 404 aur 403 hote). 401 ka matlab authenticated nahi: token lagbhag ek ghanta purana hai. Server errors 5xx hote.`}},{title:{en:`One switch drops to Partial Collection Failure`,hi:`Ek switch Partial Collection Failure mein chala gaya`},ticket:{en:`After a security clean-up, ASW2's health fell from 8 to 6 and the inventory status changed. Users on ASW2 report no problems.`,hi:`Security clean-up ke baad ASW2 ki health 8 se 6 ho gayi aur inventory status badal gaya. ASW2 ke users koi problem report nahi karte.`},out:`CTRL> center inventory
Device  Mgmt IP     Role          Reachability  Status                      Health
------  ----------  ------------  ------------  --------------------------  ------
DSW1    10.99.0.1   DISTRIBUTION  Reachable     Managed                     8/10
ASW1    10.99.0.11  ACCESS        Reachable     Managed                     8/10
ASW2    10.99.0.12  ACCESS        Reachable     Partial Collection Failure  6/10

CTRL> center issues
4  #AF5A  P3   Onboarding    ASW2    SNMP collection failing on ASW2         2s

ASW2# show running-config | include snmp
ASW2#`,q:{en:`What restores full collection?`,hi:`Full collection kaise wapas aayega?`},o:[{en:`Reboot ASW2 so the controller re-reads it`,hi:`ASW2 reboot karo taaki controller use dobara padhe`},{en:`Re-add snmp-server community nkro RO on ASW2 (or give the controller an SNMPv3 user)`,hi:`ASW2 par snmp-server community nkro RO dobara jodo (ya controller ko SNMPv3 user do)`},{en:`Remove ASW2 from inventory; it is healthy enough`,hi:`ASW2 ko inventory se hata do; woh kaafi healthy hai`},{en:`Change the SSH password on the controller`,hi:`Controller par SSH password badlo`}],a:1,w:{en:`The device is reachable but no longer has any SNMP community, so polling fails and a P3 onboarding issue caps its score. Restore the read credential the controller uses (ideally migrate to SNMPv3 in the controller and the device together).`,hi:`Device reachable hai lekin ab uske paas koi SNMP community nahi, isliye polling fail hoti hai aur P3 onboarding issue uska score cap karta hai. Controller jo read credential use karta hai use wapas lao (behtar hai controller aur device dono mein saath SNMPv3 par migrate karo).`}}];export{e as default};