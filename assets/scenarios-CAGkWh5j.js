var e=[{title:{en:`INC-2107: the guest laptop gets nothing`,hi:`INC-2107: guest laptop ko kuch nahi milta`},ticket:{en:`Since yesterday's switch change, guest devices get no service at all. Staff are fine. The guest test laptop PC2 (192.168.20.10, gateway 192.168.20.1) is on SW1 Gi0/2.`,hi:`Kal ke switch change ke baad se guest devices ko koi service nahi mil rahi. Staff theek hain. Guest test laptop PC2 (192.168.20.10, gateway 192.168.20.1) SW1 Gi0/2 par hai.`},out:`SW1#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3
10   STAFF                            active    Gi0/1
20   GUEST                            active
30   PRINTERS                         active    Gi0/2
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup`,q:{en:`What is the first fault and its fix?`,hi:`Pehla fault aur uska fix kya hai?`},o:[{en:`VLAN 20 is missing; create it with vlan 20`,hi:`VLAN 20 missing hai; vlan 20 se banao`},{en:`Gi0/2 must become a trunk`,hi:`Gi0/2 ko trunk banana hoga`},{en:`Gi0/2 is in VLAN 30; set switchport access vlan 20 on it`,hi:`Gi0/2 VLAN 30 mein hai; us par switchport access vlan 20 set karo`},{en:`PC2 needs gateway 192.168.30.1`,hi:`PC2 ko gateway 192.168.30.1 chahiye`}],a:2,w:{en:`VLAN 20 exists but has no ports; the guest port sits in VLAN 30 (PRINTERS), where no 192.168.20.x gateway exists. Moving Gi0/2 to VLAN 20 is the first fix. Changing the PC's gateway would put a guest on the printer network, which is wrong by design.`,hi:`VLAN 20 exist karta hai lekin usmein koi port nahi; guest port VLAN 30 (PRINTERS) mein baitha hai, jahan koi 192.168.20.x gateway nahi. Gi0/2 ko VLAN 20 mein daalna pehla fix hai. PC ka gateway badalna guest ko printer network par daal dega, jo design ke hisaab se galat hai.`}},{title:{en:`INC-2107 continued: still no gateway`,hi:`INC-2107 aage: abhi bhi gateway nahi`},ticket:{en:`Gi0/2 is now in VLAN 20, but PC2 still times out pinging 192.168.20.1. R1's Gi0/0.20 is up/up with encapsulation dot1Q 20. Staff and printers work.`,hi:`Gi0/2 ab VLAN 20 mein hai, lekin PC2 ka 192.168.20.1 ping abhi bhi timeout ho raha hai. R1 ka Gi0/0.20 encapsulation dot1Q 20 ke saath up/up hai. Staff aur printers chal rahe hain.`},out:`SW1#show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/0       10,30

Port        Vlans allowed and active in management domain
Gi0/0       10,30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/0       10,30`,q:{en:`Which command fixes it without breaking anything else?`,hi:`Kaunsa command bina kuch aur tode ise fix karta hai?`},o:[{en:`switchport trunk allowed vlan add 20`,hi:`switchport trunk allowed vlan add 20`},{en:`switchport trunk allowed vlan 20`,hi:`switchport trunk allowed vlan 20`},{en:`switchport trunk native vlan 20`,hi:`switchport trunk native vlan 20`},{en:`switchport mode access`,hi:`switchport mode access`}],a:0,w:{en:`VLAN 20 is not in the allowed list, so guest frames never reach R1. "add 20" keeps 10 and 30. Without "add" the list would become only 20 and staff and printers would break. Changing the native VLAN would send guest traffic untagged, and R1 expects it tagged 20.`,hi:`VLAN 20 allowed list mein nahi hai, isliye guest frames kabhi R1 tak nahi pahunchte. "add 20" 10 aur 30 ko rakhta hai. "add" ke bina list sirf 20 ho jaayegi aur staff aur printers toot jaayenge. Native VLAN badalne se guest traffic untagged jaayega, jabki R1 use tag 20 ke saath expect karta hai.`}},{title:{en:`Strange traffic between two floors`,hi:`Do floors ke beech ajeeb traffic`},ticket:{en:`After SW2 was replaced, a few devices on floor 2 get DHCP addresses from the wrong subnet, and the log below keeps appearing on SW1.`,hi:`SW2 replace hone ke baad floor 2 ke kuch devices ko galat subnet se DHCP addresses mil rahe hain, aur SW1 par neeche wala log baar baar aa raha hai.`},out:`%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/24 (999), with SW2 GigabitEthernet0/24 (1).

SW1#show interfaces trunk | include Gi0/24
Gi0/24      on               802.1q         trunking      999
Gi0/24      10,20,150,999`,q:{en:`What is the cause and fix?`,hi:`Cause aur fix kya hai?`},o:[{en:`STP is blocking Gi0/24; lower its cost`,hi:`STP Gi0/24 block kar raha hai; uski cost kam karo`},{en:`The trunk must be converted to an access port`,hi:`Trunk ko access port mein badalna hoga`},{en:`VLAN 1 must be added to SW1's allowed list`,hi:`SW1 ki allowed list mein VLAN 1 add karna hoga`},{en:`Native VLAN mismatch; set switchport trunk native vlan 999 on SW2 Gi0/24`,hi:`Native VLAN mismatch; SW2 Gi0/24 par switchport trunk native vlan 999 set karo`}],a:3,w:{en:`SW1 uses native 999, the new SW2 uses the default 1. Untagged frames from SW2's VLAN 1 land in VLAN 999 on SW1 and vice versa, merging broadcast domains. Match the native VLAN on SW2 (the design standard is 999).`,hi:`SW1 native 999 use karta hai, naya SW2 default 1. SW2 ke VLAN 1 ke untagged frames SW1 par VLAN 999 mein pahunchte hain aur ulta bhi, jisse broadcast domains mil jaate hain. SW2 par native VLAN match karo (design standard 999 hai).`}},{title:{en:`Branch router: VLAN 20 dead`,hi:`Branch router: VLAN 20 dead`},ticket:{en:`New branch. Staff (VLAN 10) browse fine. Guests (VLAN 20, 192.168.20.0/24) cannot ping their gateway 192.168.20.1. The switch trunk allows 10,20.`,hi:`Nayi branch. Staff (VLAN 10) theek browse karte hain. Guests (VLAN 20, 192.168.20.0/24) apne gateway 192.168.20.1 ko ping nahi kar pa rahe. Switch trunk 10,20 allow karta hai.`},out:`R1#show running-config interface GigabitEthernet0/0.20
Building configuration...

Current configuration : 112 bytes
!
interface GigabitEthernet0/0.20
 encapsulation dot1Q 200
 ip address 192.168.20.1 255.255.255.0
end

R1#show ip interface brief | include 0/0
GigabitEthernet0/0     unassigned      YES unset  up                    up
GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up
GigabitEthernet0/0.20  192.168.20.1    YES manual up                    up`,q:{en:`Why does VLAN 20 fail?`,hi:`VLAN 20 kyun fail ho raha hai?`},o:[{en:`The physical interface is shut down`,hi:`Physical interface shut down hai`},{en:`The sub-interface expects tag 200 but guest frames arrive tagged 20`,hi:`Sub-interface tag 200 expect karta hai lekin guest frames tag 20 ke saath aate hain`},{en:`The IP address is in the wrong subnet`,hi:`IP address galat subnet mein hai`},{en:`Sub-interfaces cannot use VLANs above 10`,hi:`Sub-interfaces 10 se upar ke VLANs use nahi kar sakte`}],a:1,w:{en:`The interface is up/up and the IP is correct, but encapsulation dot1Q 200 is a typo. Frames tagged 20 match no sub-interface. Fix with encapsulation dot1Q 20.`,hi:`Interface up/up hai aur IP sahi hai, lekin encapsulation dot1Q 200 typo hai. Tag 20 wale frames kisi sub-interface se match nahi karte. encapsulation dot1Q 20 se fix karo.`}},{title:{en:`The slow camera recorder`,hi:`Slow camera recorder`},ticket:{en:`CCTV playback from the NVR on SW1 Gi0/7 is very slow and stutters. The NVR port was recently hard-set to 100/full by a vendor technician.`,hi:`SW1 Gi0/7 par NVR se CCTV playback bahut slow hai aur atakta hai. Haal mein ek vendor technician ne NVR port ko 100/full par hard-set kiya tha.`},out:`SW1#show interfaces GigabitEthernet0/7
GigabitEthernet0/7 is up, line protocol is up (connected)
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
  Half-duplex, 100Mb/s, media type is 10/100/1000BaseTX
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     0 output errors, 3811 collisions, 0 interface resets
     0 babbles, 3790 late collision, 0 deferred`,q:{en:`What is the problem and the correct fix?`,hi:`Problem kya hai aur sahi fix kya hai?`},o:[{en:`Bad cable; replace it`,hi:`Kharab cable; badlo`},{en:`MTU too small; enable jumbo frames`,hi:`MTU bahut chhota; jumbo frames enable karo`},{en:`Duplex mismatch; set the switch port to 100/full too, or both ends to auto`,hi:`Duplex mismatch; switch port ko bhi 100/full karo, ya dono ends auto`},{en:`STP is blocking the port`,hi:`STP port block kar raha hai`}],a:2,w:{en:`The NVR is hard-set to full, so the switch's auto side fell back to half. Late collisions on the half-duplex side are the fingerprint. Make both ends match. A bad cable would show CRC/input errors, not late collisions; STP-blocked ports do not pass traffic at all.`,hi:`NVR full par hard-set hai, isliye switch ki auto side half par gir gayi. Half-duplex side par late collisions pehchaan hain. Dono ends match karo. Kharab cable CRC/input errors dikhati, late collisions nahi; STP-blocked ports traffic pass hi nahi karte.`}},{title:{en:`Uplink bundle that will not form`,hi:`Uplink bundle jo banta hi nahi`},ticket:{en:`A new access switch ACC3 was connected to DIST1 with two links meant to form Port-channel 3. Only one link carries traffic.`,hi:`Naya access switch ACC3 DIST1 se do links se joda gaya jo Port-channel 3 banane the. Sirf ek link traffic le jaata hai.`},out:`DIST1#show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
3      Po3(SD)         LACP      Gi1/0/45(I) Gi1/0/46(I)

DIST1#show running-config interface GigabitEthernet1/0/45 | include channel
 channel-group 3 mode passive

ACC3#show running-config interface GigabitEthernet1/0/49 | include channel
 channel-group 3 mode passive`,q:{en:`Why has the bundle not formed?`,hi:`Bundle kyun nahi bana?`},o:[{en:`LACP only supports one member`,hi:`LACP sirf ek member support karta hai`},{en:`Both ends are passive, so neither starts LACP; set at least one side to active`,hi:`Dono ends passive hain, isliye koi LACP shuru nahi karta; kam se kam ek side active karo`},{en:`The members need different speeds`,hi:`Members ko alag speeds chahiye`},{en:`Port-channel numbers must differ on each side`,hi:`Har side par port-channel numbers alag hone chahiye`}],a:1,w:{en:`(I) means stand-alone: no LACP partner. Passive + passive never negotiates. Set active on one or both sides. Channel-group numbers are local and need not match; members must have the same speed.`,hi:`(I) ka matlab stand-alone: koi LACP partner nahi. Passive + passive kabhi negotiate nahi karta. Ek ya dono sides par active set karo. Channel-group numbers local hote hain aur match hone zaroori nahi; members ki speed same honi chahiye.`}},{title:{en:`Backups hang, pings work`,hi:`Backups atakte hain, pings chalte hain`},ticket:{en:`The backup server (MTU 9000) can ping the storage array (MTU 9000) through two switches, but backup jobs start and then hang. The storage team says "the network is fine, ping works".`,hi:`Backup server (MTU 9000) do switches ke through storage array (MTU 9000) ko ping kar sakta hai, lekin backup jobs shuru hote hain aur phir atak jaate hain. Storage team kehti hai "network theek hai, ping chalta hai".`},out:`backup01$ ping -M do -s 1472 -c 2 10.20.0.50
1480 bytes from 10.20.0.50: icmp_seq=1 ttl=64 time=0.41 ms
1480 bytes from 10.20.0.50: icmp_seq=2 ttl=64 time=0.39 ms

backup01$ ping -M do -s 8972 -c 2 10.20.0.50
--- 10.20.0.50 ping statistics ---
2 packets transmitted, 0 received, 100% packet loss

AGG2#show system mtu
Global Ethernet MTU is 1500 bytes.`,q:{en:`What is the most likely cause?`,hi:`Sabse likely cause kya hai?`},o:[{en:`A duplex mismatch on the server NIC`,hi:`Server NIC par duplex mismatch`},{en:`STP recalculating every few minutes`,hi:`STP har kuch minute mein recalculate ho raha hai`},{en:`The storage array has the wrong gateway`,hi:`Storage array ka gateway galat hai`},{en:`MTU mismatch: AGG2 is still at 1500 while hosts send 9000-byte frames`,hi:`MTU mismatch: AGG2 abhi bhi 1500 par hai jabki hosts 9000-byte frames bhejte hain`}],a:3,w:{en:`1500-byte packets pass, 9000-byte packets with DF set fail, and AGG2's MTU is 1500. Enable jumbo frames on AGG2 (and every hop). Same-subnet traffic (TTL 64) means the gateway is not involved.`,hi:`1500-byte packets pass hote hain, DF set wale 9000-byte packets fail hote hain, aur AGG2 ka MTU 1500 hai. AGG2 (aur har hop) par jumbo frames enable karo. Same-subnet traffic (TTL 64) ka matlab gateway involved nahi hai.`}},{title:{en:`Phones stuck on "Configuring IP"`,hi:`Phones "Configuring IP" par atke`},ticket:{en:`After a switch replacement, desk phones reboot in a loop showing "Configuring IP". PCs connected through the phones work normally.`,hi:`Switch replacement ke baad desk phones "Configuring IP" dikhate hue loop mein reboot ho rahe hain. Phones ke through jude PCs normal chal rahe hain.`},out:`ACC1#show interfaces GigabitEthernet1/0/12 switchport | include VLAN
Access Mode VLAN: 10 (STAFF)
Trunking Native Mode VLAN: 1 (default)
Voice VLAN: 150 (Inactive)

ACC1#show vlan brief | include 150
ACC1#`,q:{en:`What should the engineer do?`,hi:`Engineer ko kya karna chahiye?`},o:[{en:`Create VLAN 150 in the VLAN database (vlan 150, name VOICE)`,hi:`VLAN database mein VLAN 150 banao (vlan 150, name VOICE)`},{en:`Change the port to a trunk`,hi:`Port ko trunk mein badlo`},{en:`Put the phones in VLAN 10`,hi:`Phones ko VLAN 10 mein daalo`},{en:`Disable PoE on the port`,hi:`Port par PoE disable karo`}],a:0,w:{en:`The port's voice VLAN is configured but VLAN 150 does not exist on the new switch, so it shows Inactive and the phones' tagged frames have nowhere to go. Creating VLAN 150 fixes every desk. PCs work because VLAN 10 exists.`,hi:`Port ka voice VLAN configured hai lekin naye switch par VLAN 150 exist nahi karta, isliye woh Inactive dikhta hai aur phones ke tagged frames ke paas jaane ki jagah nahi. VLAN 150 banane se har desk theek ho jaata hai. PCs chalte hain kyunki VLAN 10 exist karta hai.`}}];export{e as default};