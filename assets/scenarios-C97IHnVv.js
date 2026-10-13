var e=[{title:{en:`Everyone can sniff everyone`,hi:`Sab sabki traffic sniff kar sakte hain`},ticket:{en:`Security team: "A packet capture on an ordinary access port on ACC1 suddenly shows traffic meant for other hosts. The switch CPU is normal but the MAC table looks huge."`,hi:`Security team: "ACC1 ke ek normal access port par packet capture achanak doosre hosts ki traffic dikha raha hai. Switch CPU normal hai lekin MAC table bahut badi lag rahi hai."`},out:`ACC1# show mac address-table count
Mac Entries for Vlan 10:
---------------------------
Dynamic Address Count  : 7998
Static  Address Count  : 0
Total Mac Addresses    : 7998

Total Mac Address Space Available: 2

ACC1# show mac address-table interface g0/2 | count dynamic
Number of lines which match regexp = 7991

ACC1# show port-security interface g0/2
Port Security              : Disabled`,q:{en:`What is happening and what is the right defence?`,hi:`Kya ho raha hai aur sahi defence kya hai?`},o:[{en:`A routing loop; lower the OSPF cost`,hi:`Routing loop; OSPF cost kam karo`},{en:`A rogue DHCP server; enable DHCP snooping`,hi:`Rogue DHCP server; DHCP snooping enable karo`},{en:`MAC flooding from Gi0/2 filled the CAM table; enable port security with a small maximum on edge ports`,hi:`Gi0/2 se MAC flooding ne CAM table bhar di; edge ports par chhote maximum ke saath port security enable karo`},{en:`A duplex mismatch; hard-code speed and duplex`,hi:`Duplex mismatch; speed aur duplex hard-code karo`}],a:2,w:{en:`Almost all MACs are learned on one port and the table is full, so the switch floods unknown-unicast to every port in the VLAN. Port security caps the MACs per port and err-disables (or restricts) the flooding port.`,hi:`Lagbhag saare MACs ek hi port par seekhe gaye hain aur table bhar gayi hai, isliye switch unknown-unicast ko VLAN ke har port par flood karta hai. Port security per port MACs cap karta hai aur flooding port ko err-disable (ya restrict) karta hai.`}},{title:{en:`New laptops get the wrong gateway`,hi:`Naye laptops ko galat gateway mil raha hai`},ticket:{en:`Helpdesk: "Some users on VLAN 10 get gateway 10.0.10.66 instead of 10.0.10.1. Their browsing is slow and the proxy logs show nothing from them."`,hi:`Helpdesk: "VLAN 10 ke kuch users ko 10.0.10.1 ki jagah gateway 10.0.10.66 mil raha hai. Unki browsing slow hai aur proxy logs mein unka kuch nahi dikhta."`},out:`ACC2# show ip dhcp snooping
Switch DHCP snooping is disabled
DHCP snooping is configured on following VLANs:
none

ACC2# show mac address-table address 00de.ad00.00a2
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    00de.ad00.00a2    DYNAMIC     Gi0/2`,q:{en:`After shutting Gi0/2, what is the correct permanent fix?`,hi:`Gi0/2 shut karne ke baad sahi permanent fix kya hai?`},o:[{en:`Enable port security with maximum 1 on every port`,hi:`Har port par maximum 1 ke saath port security enable karo`},{en:`Enable DHCP snooping on VLAN 10 and trust only the uplink toward the real DHCP server`,hi:`VLAN 10 par DHCP snooping enable karo aur sirf asli DHCP server ki taraf wala uplink trust karo`},{en:`Enable BPDU guard on all edge ports`,hi:`Saare edge ports par BPDU guard enable karo`},{en:`Enable DHCP snooping and trust every access port so clients keep working`,hi:`DHCP snooping enable karo aur har access port trust karo taaki clients chalte rahein`}],a:1,w:{en:`A rogue DHCP server on Gi0/2 is answering. DHCP snooping drops OFFER/ACK on untrusted ports and builds the binding table that DAI and IP Source Guard need. Trusting access ports would defeat the purpose.`,hi:`Gi0/2 par rogue DHCP server jawab de raha hai. DHCP snooping untrusted ports par OFFER/ACK drop karta hai aur woh binding table banata hai jo DAI aur IP Source Guard ko chahiye. Access ports trust karna poora maqsad khatam kar dega.`}},{title:{en:`DAI switched on, the whole VLAN went dark`,hi:`DAI on hua, poora VLAN band ho gaya`},ticket:{en:`Change record: "Enabled ip arp inspection vlan 10 on ACC2 at 22:00." Since then no host on VLAN 10 can reach the gateway 10.0.10.1, including hosts with valid DHCP leases.`,hi:`Change record: "22:00 baje ACC2 par ip arp inspection vlan 10 enable kiya." Tab se VLAN 10 ka koi bhi host gateway 10.0.10.1 tak nahi pahunch pa raha, valid DHCP lease wale hosts bhi nahi.`},out:`ACC2# show ip arp inspection interfaces

 Interface        Trust State     Rate (pps)    Burst Interval
 ---------------  -----------     ----------    --------------
 Gi0/1            Untrusted               15                 1
 Gi0/2            Untrusted               15                 1
 Gi0/24           Untrusted               15                 1

%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Res) on Gi0/24, vlan 10.([5254.0010.0a01/10.0.10.1/0050.7900.0a11/10.0.10.10/22:04:11 UTC])`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Disable DAI on VLAN 10`,hi:`VLAN 10 par DAI disable karo`},{en:`Raise the DAI rate limit on the access ports to 100 pps`,hi:`Access ports par DAI rate limit 100 pps kar do`},{en:`Add a static binding for every client PC`,hi:`Har client PC ke liye static binding jodo`},{en:`Configure ip arp inspection trust on the uplink Gi0/24 toward the gateway`,hi:`Gateway ki taraf uplink Gi0/24 par ip arp inspection trust configure karo`}],a:3,w:{en:`The gateway's ARP replies arrive on Gi0/24, which is untrusted, and the gateway has a static IP with no snooping binding, so DAI drops them. Trusting the infrastructure uplink restores ARP while access ports stay inspected.`,hi:`Gateway ke ARP replies Gi0/24 par aate hain, jo untrusted hai, aur gateway ka static IP hai jiski koi snooping binding nahi, isliye DAI unhe drop karta hai. Infrastructure uplink trust karne se ARP wapas aa jaata hai jabki access ports inspect hote rehte hain.`}},{title:{en:`The meeting-room port is a trunk`,hi:`Meeting-room port trunk ban gaya hai`},ticket:{en:`Audit finding: "A device in meeting room 3 was seen sending traffic in VLANs 20 and 30, although the room port is meant to be VLAN 10 only."`,hi:`Audit finding: "Meeting room 3 ka ek device VLAN 20 aur 30 mein traffic bhejta dekha gaya, jabki room port sirf VLAN 10 ke liye hai."`},out:`DSW# show interfaces g0/2 switchport
Name: Gi0/2
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: trunk
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: dot1q
Negotiation of Trunking: On
Access Mode VLAN: 10 (USERS)
Trunking Native Mode VLAN: 1 (default)`,q:{en:`Which change closes this hole?`,hi:`Kaunsa change yeh hole band karta hai?`},o:[{en:`switchport mode access and switchport nonegotiate on Gi0/2`,hi:`Gi0/2 par switchport mode access aur switchport nonegotiate`},{en:`spanning-tree guard root on Gi0/2`,hi:`Gi0/2 par spanning-tree guard root`},{en:`ip verify source on Gi0/2`,hi:`Gi0/2 par ip verify source`},{en:`storm-control broadcast level 1.00 on Gi0/2`,hi:`Gi0/2 par storm-control broadcast level 1.00`}],a:0,w:{en:`The port was left in dynamic auto, so a device speaking DTP negotiated a trunk (switch spoofing). Forcing access mode and disabling DTP with nonegotiate stops it. Also move the trunk native VLAN off VLAN 1 to close double tagging.`,hi:`Port dynamic auto mein chhoda gaya tha, isliye DTP bolne wale device ne trunk negotiate kar liya (switch spoofing). Access mode force karna aur nonegotiate se DTP band karna ise rokta hai. Double tagging band karne ke liye trunk native VLAN ko VLAN 1 se hatao bhi.`}},{title:{en:`A trunk is blocking after maintenance`,hi:`Maintenance ke baad ek trunk block ho raha hai`},ticket:{en:`"After the branch team replaced ASW last night, users behind it lost connectivity. DSW is the intended root for VLAN 10 with priority 4096."`,hi:`"Kal raat branch team ne ASW replace kiya, uske baad uske peeche ke users ki connectivity chali gayi. VLAN 10 ke liye intended root DSW hai, priority 4096 ke saath."`},out:`DSW# show spanning-tree inconsistentports

Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0010             GigabitEthernet0/23      Root Inconsistent

Number of inconsistent ports (segments) in the system : 1

%SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port GigabitEthernet0/23 on VLAN0010.

ASW# show spanning-tree vlan 10 | include Priority
  Root ID    Priority    10
  Bridge ID  Priority    10     (priority 0 sys-id-ext 10)`,q:{en:`What is the right action?`,hi:`Sahi action kya hai?`},o:[{en:`Remove root guard from Gi0/23 so the trunk forwards again`,hi:`Gi0/23 se root guard hatao taaki trunk phir forward kare`},{en:`Correct ASW's bridge priority (for example back to 32768) so it stops sending superior BPDUs; root guard will unblock automatically`,hi:`ASW ki bridge priority sahi karo (jaise wapas 32768) taaki woh superior BPDUs bhejna band kare; root guard apne aap unblock karega`},{en:`Enable BPDU guard on Gi0/23`,hi:`Gi0/23 par BPDU guard enable karo`},{en:`Run shutdown / no shutdown on Gi0/23 to clear the err-disabled state`,hi:`Err-disabled state clear karne ke liye Gi0/23 par shutdown / no shutdown chalao`}],a:1,w:{en:`The replacement ASW has priority 0 and claims root. Root guard is doing its job by putting Gi0/23 in root-inconsistent (not err-disabled). Fix the priority on ASW; once superior BPDUs stop, the port recovers on its own. BPDU guard on a trunk would err-disable it.`,hi:`Replacement ASW ki priority 0 hai aur woh root claim kar raha hai. Root guard apna kaam kar raha hai, Gi0/23 ko root-inconsistent mein daal kar (err-disabled nahi). ASW par priority theek karo; superior BPDUs rukte hi port khud recover ho jaata hai. Trunk par BPDU guard use err-disable kar dega.`}},{title:{en:`A floor slows down, then one port dies`,hi:`Ek floor slow hota hai, phir ek port band ho jaata hai`},ticket:{en:`"At 11:20 the third floor became very slow for about two seconds, then everything recovered except one desk whose PC has no link light."`,hi:`"11:20 par teesra floor lagbhag do second ke liye bahut slow ho gaya, phir sab theek ho gaya siwaay ek desk ke jiske PC ki link light nahi hai."`},out:`ACC3# show interfaces status err-disabled
Port      Name               Status       Reason               Err-disabled Vlans
Gi0/7     DESK-3-17          err-disabled storm-control

%STORM_CONTROL-3-SHUTDOWN: A packet storm was detected on Gi0/7. The interface has been disabled.

ACC3# show storm-control
Interface  Filter State   Upper        Lower        Current
---------  -------------  -----------  -----------  -----------
Gi0/7      Blocking       1.00%        1.00%        0.00%`,q:{en:`What should the engineer do next?`,hi:`Engineer ko aage kya karna chahiye?`},o:[{en:`Remove storm-control from Gi0/7 so the user can work`,hi:`Gi0/7 se storm-control hatao taaki user kaam kar sake`},{en:`Raise the level to 50% and bring the port up`,hi:`Level 50% karo aur port up karo`},{en:`Visit the desk, look for a loop (for example a hub with both ends patched) or a faulty NIC, fix it, then recover the port`,hi:`Desk par jaao, loop dhoondo (jaise hub ke dono sire patch kiye hue) ya kharaab NIC, use theek karo, phir port recover karo`},{en:`Enable BPDU guard on Gi0/7 instead`,hi:`Uski jagah Gi0/7 par BPDU guard enable karo`}],a:2,w:{en:`Storm-control did what it should: it detected a broadcast storm and err-disabled the source port, which contained the outage to one desk. Find and remove the cause before recovering, or the storm returns.`,hi:`Storm-control ne wahi kiya jo karna chahiye: broadcast storm pakda aur source port err-disable kiya, jisse outage ek desk tak simit raha. Recover karne se pehle cause dhoondo aur hatao, warna storm wapas aayega.`}},{title:{en:`The static server went silent`,hi:`Static server chup ho gaya`},ticket:{en:`"After the security rollout on ACC4, DHCP users are fine but SRV (static 10.0.10.50 on Gi0/2) cannot reach the gateway."`,hi:`"ACC4 par security rollout ke baad DHCP users theek hain lekin SRV (static 10.0.10.50, Gi0/2 par) gateway tak nahi pahunch pa raha."`},out:`ACC4# show ip verify source
Interface  Filter-type  Filter-mode  IP-address       Mac-address        Vlan
---------  -----------  -----------  ---------------  -----------------  ----
Gi0/1      ip           active       10.0.10.10       -                  10
Gi0/2      ip           active       deny-all         deny-all

%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Req) on Gi0/2, vlan 10.([0050.5555.5050/10.0.10.50/0000.0000.0000/10.0.10.1/09:02:17 UTC])`,q:{en:`Which single change fixes SRV while keeping every defence on?`,hi:`Kaunsa ek change har defence on rakhte hue SRV ko theek karta hai?`},o:[{en:`no ip verify source on Gi0/2`,hi:`Gi0/2 par no ip verify source`},{en:`ip dhcp snooping trust on Gi0/2`,hi:`Gi0/2 par ip dhcp snooping trust`},{en:`no ip arp inspection vlan 10`,hi:`no ip arp inspection vlan 10`},{en:`ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2`,hi:`ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2`}],a:3,w:{en:`SRV never used DHCP, so it has no binding: IPSG shows deny-all and DAI drops its ARP. One static binding satisfies both features. Trusting Gi0/2 or disabling DAI/IPSG would reopen the attack surface.`,hi:`SRV ne kabhi DHCP use nahi kiya, isliye uski binding nahi: IPSG deny-all dikhata hai aur DAI uska ARP drop karta hai. Ek static binding dono features ko satisfy karti hai. Gi0/2 trust karna ya DAI/IPSG disable karna attack surface dobara khol dega.`}},{title:{en:`The hot desk with a docking station`,hi:`Docking station wala hot desk`},ticket:{en:`"On hot desk 12, the laptop works but the monitor's built-in network port on the docking station does not. Port security is set to restrict."`,hi:`"Hot desk 12 par laptop chalta hai lekin docking station ke monitor wala built-in network port nahi chalta. Port security restrict par set hai."`},out:`ACC1# show port-security interface g0/12
Port Security              : Enabled
Port Status                : Secure-up
Violation Mode             : Restrict
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 0050.7966.0c12:10
Security Violation Count   : 184`,q:{en:`What is the best fix?`,hi:`Sabse achha fix kya hai?`},o:[{en:`Raise the maximum to 2 on Gi0/12 (keeping restrict), so the dock's MAC is allowed alongside the laptop`,hi:`Gi0/12 par maximum 2 karo (restrict rakhte hue), taaki laptop ke saath dock ka MAC bhi allow ho`},{en:`Change the violation mode to protect to stop the counter rising`,hi:`Counter badhna rokne ke liye violation mode protect karo`},{en:`Disable port security on hot desks`,hi:`Hot desks par port security disable karo`},{en:`Enable BPDU guard on Gi0/12`,hi:`Gi0/12 par BPDU guard enable karo`}],a:0,w:{en:`With maximum 1, the dock's second MAC is a violation; restrict drops it and counts each frame (184). Raising the maximum to the real number of devices keeps protection against flooding. Protect would hide the problem, not fix it.`,hi:`Maximum 1 ke saath dock ka doosra MAC violation hai; restrict use drop karta hai aur har frame count karta hai (184). Maximum ko devices ki asli ginti tak badhane se flooding ke khilaaf protection bani rehti hai. Protect problem chhupa dega, theek nahi karega.`}}];export{e as default};