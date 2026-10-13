var e=[{title:{en:`Controller reachable, management interface not declared`,hi:`Controller reachable hai, management interface declare nahi`},ticket:{en:`WLC1 is new. SW1 trunk, Vlan99 and the default route are done. The helpdesk can ping 10.10.99.10 from R1, but show ap summary lists no APs. You collect evidence.`,hi:`WLC1 naya hai. SW1 trunk, Vlan99 aur default route ho chuke hain. Helpdesk R1 se 10.10.99.10 ping kar sakta hai, lekin show ap summary mein koi AP nahi. Aap evidence jama karte ho.`},out:`WLC1# show ip interface brief
Interface                   IP-Address      OK?  Method  Status                Protocol
GigabitEthernet1            unassigned      YES  unset   up                    up
Vlan99                      10.10.99.10     YES  manual  up                    up

WLC1# show wireless management interface

Wireless management interface : (not configured)
IP address                    : (interface down or no address)

WLC1# show ap summary

Number of APs: 0`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`wireless management interface Vlan99`,hi:`wireless management interface Vlan99`},{en:`A policy tag`,hi:`Ek policy tag`},{en:`A new WLAN profile`,hi:`Naya WLAN profile`},{en:`An RF profile`,hi:`Ek RF profile`}],a:0,w:{en:`The SVI is up and has an address, but the platform was never told that Vlan99 is the wireless management interface. Declare it and the APs register.`,hi:`SVI up hai aur address hai, lekin platform ko kabhi nahi bataya gaya ki Vlan99 wireless management interface hai. Declare karo aur APs register ho jaate hain.`}},{title:{en:`SVI shut down`,hi:`SVI shut down`},ticket:{en:`After typing the Vlan99 address a technician left. The controller cannot reach R1 and no AP is registered.`,hi:`Vlan99 ka address type karke technician chala gaya. Controller R1 tak nahi pahunchta aur koi AP registered nahi.`},out:`WLC1# show ip interface brief
Interface                   IP-Address      OK?  Method  Status                Protocol
GigabitEthernet1            unassigned      YES  unset   up                    up
Vlan99                      10.10.99.10     YES  manual  administratively down down

WLC1# ping 10.10.99.1
Sending 5, 100-byte ICMP Echos to 10.10.99.1, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)`,q:{en:`What is the minimal fix?`,hi:`Minimal fix kya hai?`},o:[{en:`Reload the controller`,hi:`Controller reload karo`},{en:`Change the trunk to an access port`,hi:`Trunk ko access port banao`},{en:`Add a new WLAN`,hi:`Naya WLAN add karo`},{en:`interface Vlan99, then no shutdown`,hi:`interface Vlan99, phir no shutdown`}],a:3,w:{en:`Status says administratively down. One no shutdown on Vlan99 brings the interface and the gateway path up.`,hi:`Status administratively down kehta hai. Vlan99 par ek no shutdown interface aur gateway path up kar deta hai.`}},{title:{en:`APs in discovery`,hi:`APs discovery mein`},ticket:{en:`The controller and its management interface are healthy and reachable from R1. AP1 and AP2 have addresses in VLAN 10 but never register. You read the AP view.`,hi:`Controller aur uska management interface healthy hain aur R1 se reachable hain. AP1 aur AP2 ko VLAN 10 mein address mile hain lekin register nahi hote. Aap AP view padhte ho.`},out:`WLC1# show wireless management interface

Wireless management interface : Vlan99
IP address                    : 10.10.99.10/24

WLC1# show ap summary

Number of APs: 2

AP Name              Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
------------------------------------------------------------
AP1                  2      C9120AXI-D    aaaa.bb01.0001  aaaa.bb01.0010  IN  10.10.10.21     Discovery
AP2                  2      C9120AXI-D    aaaa.bb01.0002  aaaa.bb01.0020  IN  10.10.10.22     Discovery`,q:{en:`Which is the most likely cause?`,hi:`Sabse likely cause kaunsa hai?`},o:[{en:`The WLAN uses WPA2`,hi:`WLAN WPA2 use karta hai`},{en:`The AP pool on R1 does not give option 43 pointing to 10.10.99.10`,hi:`R1 par AP pool 10.10.99.10 ki taraf point karne wala option 43 nahi deta`},{en:`The policy tag is empty`,hi:`Policy tag khaali hai`},{en:`The RF tag is default`,hi:`RF tag default hai`}],a:1,w:{en:`APs have IPs but are stuck in Discovery and the controller is healthy. In a different subnet they need option 43 or DNS. Fix on R1: option 43 hex f104.0a0a.630a in AP-POOL, then renew the AP leases.`,hi:`APs ke paas IP hai lekin Discovery mein atke hain aur controller healthy hai. Alag subnet mein unhe option 43 ya DNS chahiye. R1 par fix: AP-POOL mein option 43 hex f104.0a0a.630a, phir AP leases renew karo.`}},{title:{en:`First SSID not visible: tags`,hi:`Pehla SSID visible nahi: tags`},ticket:{en:`NK-STAFF, PP-STAFF and PT-CAMPUS are built and enabled. LAPTOP1 reports that NK-STAFF is not found. Both APs show Registered.`,hi:`NK-STAFF, PP-STAFF aur PT-CAMPUS bane aur enabled hain. LAPTOP1 kehta hai NK-STAFF nahi mila. Dono APs Registered dikhte hain.`},out:`WLC1# show ap tag summary

Number of APs: 2

AP Name              AP Mac           Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
------------------------------------------------------------
AP1                  aaaa.bb01.0001   default-site-tag      default-policy-tag    default-rf-tag      No             Default
AP2                  aaaa.bb01.0002   default-site-tag      default-policy-tag    default-rf-tag      No             Default

WLC1# show wireless tag policy detailed PT-CAMPUS
Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: 1
NK-STAFF                            PP-STAFF`,q:{en:`What do you do?`,hi:`Aap kya karte ho?`},o:[{en:`Delete NK-STAFF and recreate it`,hi:`NK-STAFF delete karke dobara banao`},{en:`Change PP-STAFF to VLAN 30`,hi:`PP-STAFF ko VLAN 30 karo`},{en:`ap name AP1 policy-tag PT-CAMPUS and ap name AP2 policy-tag PT-CAMPUS`,hi:`ap name AP1 policy-tag PT-CAMPUS aur ap name AP2 policy-tag PT-CAMPUS`},{en:`Shut down both APs`,hi:`Dono APs shut karo`}],a:2,w:{en:`The tag and its map are correct, but both APs have Policy Tag default-policy-tag with source Default. Assign the existing tag and nothing else changes.`,hi:`Tag aur uska map sahi hain, lekin dono APs ka Policy Tag default-policy-tag hai aur source Default. Maujooda tag assign karo aur kuch aur nahi badalta.`}},{title:{en:`Created but never enabled`,hi:`Bana diya lekin enable nahi kiya`},ticket:{en:`A junior engineer built NK-STAFF, PP-STAFF and PT-CAMPUS, tagged both APs and went home. LAPTOP1 still sees nothing.`,hi:`Junior engineer ne NK-STAFF, PP-STAFF aur PT-CAMPUS banaye, dono APs tag kiye aur ghar chala gaya. LAPTOP1 ko phir bhi kuch nahi dikhta.`},out:`WLC1# show wlan summary

Number of WLANs: 1

ID   Profile Name                     SSID                             Status Security
------------------------------------------------------------
1    NK-STAFF                         NK-STAFF                         DOWN   [WPA2][PSK][AES]

WLC1# show wireless profile policy detailed PP-STAFF

Policy Profile Name              : PP-STAFF
Status                           : DISABLED
VLAN                             : 20`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The VLAN number is wrong`,hi:`VLAN number galat hai`},{en:`The WLAN and the policy profile are shut down; both need no shutdown`,hi:`WLAN aur policy profile shut down hain; dono ko no shutdown chahiye`},{en:`The AP country is wrong`,hi:`AP country galat hai`},{en:`The tag has too many maps`,hi:`Tag mein bahut zyada maps hain`}],a:1,w:{en:`New WLANs and policy profiles start shut down. Status DOWN and DISABLED mean nothing is broadcast. Enable both objects.`,hi:`Naye WLANs aur policy profiles shut down shuru hote hain. Status DOWN aur DISABLED ka matlab kuch broadcast nahi hota. Dono objects enable karo.`}},{title:{en:`Only AP2 was tagged`,hi:`Sirf AP2 tag hua`},ticket:{en:`LAPTOP2 near AP2 works. LAPTOP1 near AP1 cannot find NK-STAFF. Both APs are Registered.`,hi:`AP2 ke paas LAPTOP2 chalta hai. AP1 ke paas LAPTOP1 ko NK-STAFF nahi milta. Dono APs Registered hain.`},out:`WLC1# show ap tag summary

Number of APs: 2

AP Name              AP Mac           Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
------------------------------------------------------------
AP1                  aaaa.bb01.0001   default-site-tag      default-policy-tag    default-rf-tag      No             Default
AP2                  aaaa.bb01.0002   default-site-tag      PT-CAMPUS             default-rf-tag      No             Static`,q:{en:`Which action fixes only the fault?`,hi:`Kaunsa action sirf fault fix karta hai?`},o:[{en:`Recreate PT-CAMPUS`,hi:`PT-CAMPUS dobara banao`},{en:`Retag AP2 with default-policy-tag`,hi:`AP2 ko default-policy-tag se retag karo`},{en:`Disable NK-STAFF`,hi:`NK-STAFF disable karo`},{en:`ap name AP1 policy-tag PT-CAMPUS`,hi:`ap name AP1 policy-tag PT-CAMPUS`}],a:3,w:{en:`AP2 is fine with a Static PT-CAMPUS. AP1 still uses the default tag, so give AP1 the same tag and leave AP2 alone.`,hi:`AP2 Static PT-CAMPUS ke saath theek hai. AP1 abhi default tag use karta hai, isliye AP1 ko wahi tag do aur AP2 ko mat chhedo.`}},{title:{en:`Not every missing SSID is a tag problem`,hi:`Har missing SSID tag problem nahi hota`},ticket:{en:`Both APs carry PT-CAMPUS, and the WLAN and policy profile are enabled. LAPTOP1 finds NK-STAFF and completes the PSK handshake, but the controller then refuses the association and the laptop never gets an address in VLAN 20.`,hi:`Dono APs PT-CAMPUS carry karte hain, aur WLAN aur policy profile enabled hain. LAPTOP1 ko NK-STAFF mil jaata hai aur PSK handshake complete hota hai, lekin controller association refuse kar deta hai aur VLAN 20 mein address nahi milta.`},out:`LAPTOP1> wifi connect NK-STAFF psk NkStaff2024
Found "NK-STAFF" on AP1 (5 GHz, channel 36, -62 dBm)
WPA2-PSK 4-way handshake ... completed
Association rejected by the controller.

WLC1# show logging
%CLIENT_ORCH_LOG-3-VLAN_MISSING: policy profile PP-STAFF uses VLAN 20 which is not in the VLAN database; client cannot be placed

WLC1# show wireless profile policy detailed PP-STAFF
Status                           : ENABLED
VLAN                             : 20  (NOT IN VLAN DATABASE)`,q:{en:`Which stage fails and what is the owner of the fix?`,hi:`Kaunsa stage fail hai aur fix ka owner kaun hai?`},o:[{en:`Stage 1, the wireless management interface`,hi:`Stage 1, wireless management interface`},{en:`Stage 4, addressing: VLAN 20 must exist in the controller VLAN database`,hi:`Stage 4, addressing: VLAN 20 controller VLAN database mein exist karna chahiye`},{en:`Stage 2, AP tagging`,hi:`Stage 2, AP tagging`},{en:`Stage 3, the PSK`,hi:`Stage 3, PSK`}],a:1,w:{en:`The PSK handshake completed, so join, tags and security work. The controller then refused to place the client (on real hardware you often see the client drop or sit without an address), so the failing stage is addressing, and the policy VLAN is flagged as not in the VLAN database. Create vlan 20 (STAFF) on the controller. This fault is covered in depth later.`,hi:`PSK handshake complete hua, isliye join, tags aur security kaam karte hain. Controller ne phir client ko place karne se mana kiya (real hardware par aksar client drop hota hai ya bina address ke rehta hai), isliye fail stage addressing hai, aur policy VLAN "not in VLAN database" flag hua hai. Controller par vlan 20 (STAFF) banao. Yeh fault baad mein gehrai se cover hota hai.`}}];export{e as default};