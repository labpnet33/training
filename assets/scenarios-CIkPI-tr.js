var e=[{title:{en:`New VM VLAN not reachable on one host`,hi:`Ek host par naya VM VLAN reachable nahi`},ticket:{en:`Virtualisation team: "We created port group VLAN 30 (APP-B). VMs on ESX-07 cannot reach their gateway 10.30.0.1; the same VLAN works on ESX-08." ESX-07 is on LEAF3 Ethernet1/7.`,hi:`Virtualisation team: "Humne port group VLAN 30 (APP-B) banaya. ESX-07 ke VMs apne gateway 10.30.0.1 tak nahi pahunch pa rahe; same VLAN ESX-08 par chal raha hai." ESX-07 LEAF3 ke Ethernet1/7 par hai.`},out:`LEAF3# show interface trunk
--------------------------------------------------------------------------------
Port          Native  Status        Port
              Vlan                  Channel
--------------------------------------------------------------------------------
Eth1/7        999     trunking      --
Eth1/8        999     trunking      --
--------------------------------------------------------------------------------
Port          Vlans Allowed on Trunk
--------------------------------------------------------------------------------
Eth1/7        10,20
Eth1/8        10,20,30

LEAF3# show vlan id 30
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
30   APP-B                            active    Eth1/8`,q:{en:`What is the cause and the correct fix?`,hi:`Cause kya hai aur sahi fix kya hai?`},o:[{en:`VLAN 30 does not exist on LEAF3; create it with vlan 30.`,hi:`LEAF3 par VLAN 30 exist nahi karta; vlan 30 se banao.`},{en:`VLAN 30 is not allowed on Eth1/7; add it with switchport trunk allowed vlan add 30.`,hi:`Eth1/7 par VLAN 30 allowed nahi hai; switchport trunk allowed vlan add 30 se jodo.`},{en:`The native VLAN is wrong; change it to 30 on Eth1/7.`,hi:`Native VLAN galat hai; Eth1/7 par ise 30 karo.`},{en:`Replace the list with switchport trunk allowed vlan 30.`,hi:`List ko switchport trunk allowed vlan 30 se replace karo.`}],a:1,w:{en:`The VLAN exists and is active (Eth1/8 carries it), but Eth1/7 allows only 10,20. Use "add 30"; typing "allowed vlan 30" without add would cut VLANs 10 and 20 for every VM on ESX-07.`,hi:`VLAN exist karta hai aur active hai (Eth1/8 use le jaata hai), lekin Eth1/7 sirf 10,20 allow karta hai. "add 30" use karo; bina add ke "allowed vlan 30" type karne se ESX-07 ke har VM ke liye VLANs 10 aur 20 kat jaayenge.`}},{title:{en:`Server port went down after a cabling job`,hi:`Cabling job ke baad server port down ho gaya`},ticket:{en:`Remote hands re-cabled rack R14 for a new "mini lab". Since then, server DB14 on LEAF6 Ethernet1/12 has no link. The server team says their NIC is fine.`,hi:`Remote hands ne ek naye "mini lab" ke liye rack R14 ko dobara cable kiya. Tab se LEAF6 Ethernet1/12 par server DB14 ka link nahi hai. Server team kehti hai unka NIC theek hai.`},out:`LEAF6# show interface Ethernet1/12
Ethernet1/12 is down (errDisabled)
  admin state is up, Dedicated Interface
  Hardware: 1000/10000/25000 Ethernet, address: 00de.fb66.0c0c

LEAF6# show logging last 3
2026 Sep 29 09:41:17 LEAF6 %STP-2-BLOCK_BPDUGUARD: Received BPDU on port Ethernet1/12 with BPDU Guard enabled. Disabling port.
2026 Sep 29 09:41:17 LEAF6 %ETHPORT-2-IF_DOWN_ERROR_DISABLED: Interface Ethernet1/12 is down (Error disabled. Reason:BPDUGuard errDisable)
2026 Sep 29 09:41:17 LEAF6 %ETHPORT-5-IF_DOWN_ERROR_DISABLED: Interface Ethernet1/12 is down`,q:{en:`What happened, and what should be done?`,hi:`Kya hua, aur kya karna chahiye?`},o:[{en:`The optic failed; replace the transceiver.`,hi:`Optic fail hua; transceiver badlo.`},{en:`The port is in the wrong VLAN; change the access VLAN.`,hi:`Port galat VLAN mein hai; access VLAN badlo.`},{en:`Disable BPDU guard on the port so it stays up.`,hi:`Port par BPDU guard disable karo taaki woh up rahe.`},{en:`A switch now sits behind the port and sent BPDUs; remove it from the server path, then shut/no shut the port.`,hi:`Ab port ke peeche ek switch hai jisne BPDUs bheje; use server path se hatao, phir port ko shut/no shut karo.`}],a:3,w:{en:`BPDU guard error-disabled the edge port because a BPDU arrived: the "mini lab" put a switch in the path. Remove the switch, then recover with shutdown / no shutdown. Disabling BPDU guard would invite a loop.`,hi:`BPDU aane ki wajah se BPDU guard ne edge port ko error-disable kiya: "mini lab" ne path mein switch daal diya. Switch hatao, phir shutdown / no shutdown se recover karo. BPDU guard disable karna loop ko nyota dena hai.`}},{title:{en:`New spine uplink never forms OSPF`,hi:`Naya spine uplink kabhi OSPF nahi banata`},ticket:{en:`LEAF4 Eth1/50 to SPINE2 was patched today. Link is up and the /31 pings, but the OSPF neighbour never reaches FULL.`,hi:`LEAF4 Eth1/50 se SPINE2 aaj patch hua. Link up hai aur /31 ping hota hai, lekin OSPF neighbour kabhi FULL tak nahi pahunchta.`},out:`LEAF4# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 2
 Neighbor ID     Pri State            Up Time  Address         Interface
 10.255.0.11       1 FULL/ -          5d02h    10.1.4.0        Eth1/49
 10.255.0.12       1 EXSTART/ -       00:04:31 10.1.5.0        Eth1/50

LEAF4# show interface Ethernet1/49 | include MTU
  MTU 9216 bytes, BW 100000000 Kbit/sec, DLY 10 usec
LEAF4# show interface Ethernet1/50 | include MTU
  MTU 1500 bytes, BW 100000000 Kbit/sec, DLY 10 usec`,q:{en:`What is the right fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Set mtu 9216 on LEAF4 Ethernet1/50 to match the fabric standard.`,hi:`Fabric standard se match karne ke liye LEAF4 Ethernet1/50 par mtu 9216 set karo.`},{en:`Configure ip ospf mtu-ignore on both sides.`,hi:`Dono sides par ip ospf mtu-ignore configure karo.`},{en:`Change the network type to broadcast.`,hi:`Network type ko broadcast karo.`},{en:`Change the OSPF router ID on LEAF4.`,hi:`LEAF4 par OSPF router ID badlo.`}],a:0,w:{en:`EXSTART with a 1500 vs 9216 MTU is the classic OSPF MTU mismatch. Fix the MTU; mtu-ignore would let OSPF come up while jumbo and VXLAN traffic is still dropped on that link.`,hi:`1500 vs 9216 MTU ke saath EXSTART classic OSPF MTU mismatch hai. MTU theek karo; mtu-ignore OSPF ko up hone dega jabki us link par jumbo aur VXLAN traffic phir bhi drop hoga.`}},{title:{en:`Port-channel running at half speed`,hi:`Port-channel aadhi speed par chal raha hai`},ticket:{en:`Monitoring shows Po20 between LEAF1 and the backup appliance at 25G instead of 50G. No link is down.`,hi:`Monitoring dikhata hai ki LEAF1 aur backup appliance ke beech Po20 50G ki jagah 25G par hai. Koi link down nahi hai.`},out:`LEAF1# show port-channel summary | include Po20
20    Po20(SU)    Eth      LACP      Eth1/21(P)   Eth1/22(s)

LEAF1# show running-config interface Ethernet1/21-22
interface Ethernet1/21
  switchport mode trunk
  switchport trunk allowed vlan 40,41
  channel-group 20 mode active
interface Ethernet1/22
  switchport mode trunk
  switchport trunk allowed vlan 40
  channel-group 20 mode active`,q:{en:`Why is Eth1/22 not carrying traffic?`,hi:`Eth1/22 traffic kyun nahi le ja raha?`},o:[{en:`The appliance is in LACP passive mode.`,hi:`Appliance LACP passive mode mein hai.`},{en:`The port-channel needs lacp min-links 2.`,hi:`Port-channel ko lacp min-links 2 chahiye.`},{en:`It is suspended because its allowed VLAN list differs from the other member.`,hi:`Yeh suspended hai kyunki iski allowed VLAN list dusre member se alag hai.`},{en:`The hash sends all flows to Eth1/21 by design.`,hi:`Hash design ke hisaab se saare flows Eth1/21 par bhejta hai.`}],a:2,w:{en:`(s) means suspended: members must have compatible configuration. Eth1/22 allows only VLAN 40. Make the lists identical (configure the port-channel interface, which pushes to members) and the member returns to (P).`,hi:`(s) matlab suspended: members ki configuration compatible honi chahiye. Eth1/22 sirf VLAN 40 allow karta hai. Lists ko identical karo (port-channel interface configure karo, jo members tak push hota hai) aur member (P) par wapas aa jaayega.`}},{title:{en:`Cannot reach the syslog server from new leaves`,hi:`Naye leaves se syslog server tak nahi pahunch pa rahe`},ticket:{en:`Syslog server 192.0.2.60 on the management network receives nothing from the new leaves. An engineer tested connectivity and says "the management network is down".`,hi:`Management network par syslog server 192.0.2.60 ko naye leaves se kuch nahi mil raha. Ek engineer ne connectivity test ki aur kehta hai "management network down hai".`},out:`LEAF12# ping 192.0.2.60
PING 192.0.2.60 (192.0.2.60): 56 data bytes
ping: sendto 192.0.2.60 64 chars, No route to host
Request 0 timed out

LEAF12# ping 192.0.2.60 vrf management
PING 192.0.2.60 (192.0.2.60): 56 data bytes
64 bytes from 192.0.2.60: icmp_seq=0 ttl=63 time=0.912 ms
64 bytes from 192.0.2.60: icmp_seq=1 ttl=63 time=0.805 ms

LEAF12# show running-config | include logging
logging server 192.0.2.60 6`,q:{en:`What is the correct conclusion and fix?`,hi:`Sahi conclusion aur fix kya hai?`},o:[{en:`The management network is down; open a ticket with the facilities team.`,hi:`Management network down hai; facilities team ke saath ticket kholo.`},{en:`Add a default route in the default VRF towards mgmt0.`,hi:`Default VRF mein mgmt0 ki taraf default route jodo.`},{en:`Management works; configure logging server 192.0.2.60 6 use-vrf management.`,hi:`Management kaam kar raha hai; logging server 192.0.2.60 6 use-vrf management configure karo.`},{en:`Enable feature syslog.`,hi:`feature syslog enable karo.`}],a:2,w:{en:`The ping works in VRF management, so the network is fine. The logging server is configured without use-vrf management, so the leaf looks it up in the default VRF. Mixing mgmt0 into the default VRF is not how NX-OS works.`,hi:`VRF management mein ping chalta hai, isliye network theek hai. Logging server bina use-vrf management ke configured hai, isliye leaf use default VRF mein dhoondhta hai. mgmt0 ko default VRF mein milana NX-OS ka tareeka nahi hai.`}},{title:{en:`Only one spine carries traffic`,hi:`Sirf ek spine traffic le jaata hai`},ticket:{en:`An eBGP fabric was just built. Interface counters show LEAF1 sends all traffic towards LEAF2 through SPINE1; SPINE2 uplink is almost idle. Both BGP sessions are Established.`,hi:`Ek eBGP fabric abhi bana hai. Interface counters dikhate hain ki LEAF1 LEAF2 ki taraf saara traffic SPINE1 se bhejta hai; SPINE2 uplink lagbhag idle hai. Dono BGP sessions Established hain.`},out:`LEAF1# show bgp ipv4 unicast summary
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.1.0.0        4 65000     812     809       31    0    0    02:11:40 18
10.1.1.0        4 65000     810     811       31    0    0    02:11:38 18

LEAF1# show ip route 10.255.0.2
IP Route Table for VRF "default"
10.255.0.2/32, ubest/mbest: 1/0
    *via 10.1.0.0, [20/0], 02:11:35, bgp-65011, external, tag 65000`,q:{en:`What should be configured to use both spines?`,hi:`Dono spines use karne ke liye kya configure karna chahiye?`},o:[{en:`maximum-paths (for example 4) under router bgp 65011, address-family ipv4 unicast.`,hi:`router bgp 65011, address-family ipv4 unicast ke neeche maximum-paths (jaise 4).`},{en:`A static route to 10.255.0.2 via SPINE2.`,hi:`SPINE2 ke through 10.255.0.2 ka static route.`},{en:`Lower the AD of eBGP to 1.`,hi:`eBGP ka AD 1 kar do.`},{en:`Change port-channel load-balance to include L4 ports.`,hi:`Port-channel load-balance ko L4 ports include karne ke liye badlo.`}],a:0,w:{en:`Both spines advertise the route with the same path attributes, but BGP installs one best path unless maximum-paths is raised. After the change, show ip route should show ubest 2 with two via lines.`,hi:`Dono spines route ko same path attributes ke saath advertise karte hain, lekin BGP ek best path install karta hai jab tak maximum-paths badhaya na jaaye. Change ke baad show ip route mein do via lines ke saath ubest 2 dikhna chahiye.`}}];export{e as default};