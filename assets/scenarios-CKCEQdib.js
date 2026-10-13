var e=[{title:{en:`One department cut off after a router swap`,hi:`Router swap ke baad ek department cut off`},ticket:{en:`Nirmaan Builders, Hyderabad branch. After the router was replaced from a hand-edited config, Accounts (VLAN 30) cannot reach anything, not even its gateway 10.40.30.1. Sales (VLAN 10) and Design (VLAN 20) work.`,hi:`Nirmaan Builders, Hyderabad branch. Hand-edited config se router replace hone ke baad Accounts (VLAN 30) kuch bhi reach nahi kar pa raha, apna gateway 10.40.30.1 bhi nahi. Sales (VLAN 10) aur Design (VLAN 20) chal rahe hain.`},out:`BR-R1#show ip interface brief | include 0/0
GigabitEthernet0/0     unassigned      YES unset  up                    up
GigabitEthernet0/0.10  10.40.10.1      YES manual up                    up
GigabitEthernet0/0.20  10.40.20.1      YES manual up                    up
GigabitEthernet0/0.30  10.40.30.1      YES manual up                    up

BR-R1#show vlans | include ID|Interface
Virtual LAN ID:  10 (IEEE 802.1Q Encapsulation)
   vLAN Trunk Interface:   GigabitEthernet0/0.10
Virtual LAN ID:  20 (IEEE 802.1Q Encapsulation)
   vLAN Trunk Interface:   GigabitEthernet0/0.20
Virtual LAN ID:  3 (IEEE 802.1Q Encapsulation)
   vLAN Trunk Interface:   GigabitEthernet0/0.30`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`no shutdown on Gi0/0.30`,hi:`Gi0/0.30 par no shutdown`},{en:`Under Gi0/0.30: encapsulation dot1Q 30, then re-check the IP address`,hi:`Gi0/0.30 ke andar: encapsulation dot1Q 30, phir IP address dobara check karo`},{en:`Change the IP of Gi0/0.30 to 10.40.3.1`,hi:`Gi0/0.30 ka IP 10.40.3.1 karo`},{en:`Rename the subinterface to Gi0/0.3`,hi:`Subinterface ka naam Gi0/0.3 karo`}],a:1,w:{en:`Gi0/0.30 is bound to VLAN 3, not 30, yet it shows up/up because the parent link is fine. VLAN 30 frames tagged 30 match no subinterface. Fix the encapsulation. The subinterface name is only a label, so renaming does nothing, and it is not shut down.`,hi:`Gi0/0.30 VLAN 30 ki jagah VLAN 3 se bandha hai, phir bhi up/up dikhata hai kyunki parent link theek hai. Tag 30 wale VLAN 30 frames kisi subinterface se match nahi karte. Encapsulation theek karo. Subinterface ka naam sirf label hai, rename se kuch nahi hoga, aur woh shut bhi nahi hai.`}},{title:{en:`New core switch, no routing`,hi:`Naya core switch, routing nahi`},ticket:{en:`Aarav Pharma, Ahmedabad. The old core router was replaced with a Layer 3 switch and the SVI addresses were copied from the router config. Users ping their own gateway but not the ERP server in VLAN 100.`,hi:`Aarav Pharma, Ahmedabad. Purana core router Layer 3 switch se replace hua aur SVI addresses router config se copy kiye gaye. Users apna gateway ping kar lete hain lekin VLAN 100 ka ERP server nahi.`},out:`CORE-SW#show ip interface brief | include Vlan
Vlan10                 10.8.10.1       YES NVRAM  up                    up
Vlan20                 10.8.20.1       YES NVRAM  up                    up
Vlan100                10.8.100.1      YES NVRAM  up                    up

CORE-SW#show ip route
Default gateway is not set

Host               Gateway           Last Use    Total Uses  Interface
ICMP redirect cache is empty`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`The SVIs are shut down`,hi:`SVIs shut hain`},{en:`VLAN 100 is missing`,hi:`VLAN 100 missing hai`},{en:`IP routing is not enabled on the switch`,hi:`Switch par IP routing enable nahi hai`},{en:`ip default-gateway is not set`,hi:`ip default-gateway set nahi hai`}],a:2,w:{en:`A host-style output ("Default gateway is not set" plus an ICMP redirect cache) is what a switch prints when ip routing is off. The SVIs are up/up, so they are neither shut nor missing their VLAN. ip default-gateway would only affect the switch's own management traffic. Enable ip routing.`,hi:`Host-style output ("Default gateway is not set" plus ICMP redirect cache) switch tab print karta hai jab ip routing off ho. SVIs up/up hain, isliye na shut hain na unka VLAN missing hai. ip default-gateway sirf switch ke apne management traffic ko affect karta. ip routing enable karo.`}},{title:{en:`Guest SVI stays down before the event`,hi:`Event se pehle guest SVI down hi rehta hai`},ticket:{en:`Coastline Resorts, Goa. Guest VLAN 70 was configured on the distribution switch for tomorrow's conference. The SVI will not come up. The conference-hall access switch is connected through Gi1/0/1.`,hi:`Coastline Resorts, Goa. Kal ki conference ke liye distribution switch par guest VLAN 70 configure hua. SVI up nahi ho raha. Conference-hall access switch Gi1/0/1 se juda hai.`},out:`DIST-SW#show ip interface brief | include Vlan70
Vlan70                 10.70.0.1       YES manual up                    down

DIST-SW#show vlan brief | include ^70
70   GUEST                            active

DIST-SW#show interfaces trunk | include Gi1/0/1
Gi1/0/1     on               802.1q         trunking      999
Gi1/0/1     10,20,999
Gi1/0/1     10,20,999
Gi1/0/1     10,20,999`,q:{en:`What is the best explanation and fix?`,hi:`Sabse sahi explanation aur fix kya hai?`},o:[{en:`The SVI needs no shutdown`,hi:`SVI ko no shutdown chahiye`},{en:`ip routing is off; enable it`,hi:`ip routing off hai; enable karo`},{en:`The VLAN name must match the SVI description`,hi:`VLAN name SVI description se match hona chahiye`},{en:`No port in VLAN 70 is forwarding; allow VLAN 70 on the Gi1/0/1 trunk`,hi:`VLAN 70 ka koi port forwarding nahi; Gi1/0/1 trunk par VLAN 70 allow karo`}],a:3,w:{en:`The VLAN exists and is active, and the SVI status is "up" (not shut), so autostate is holding the protocol down: no port in VLAN 70 is up and forwarding. The only trunk allows 10,20,999. switchport trunk allowed vlan add 70 brings the SVI up. ip routing does not affect SVI state.`,hi:`VLAN exist karta hai aur active hai, aur SVI status "up" hai (shut nahi), isliye autostate protocol ko down rakh raha hai: VLAN 70 ka koi port up aur forwarding nahi. Akela trunk 10,20,999 allow karta hai. switchport trunk allowed vlan add 70 se SVI up ho jaata hai. ip routing SVI state ko affect nahi karta.`}},{title:{en:`New branch router cannot see any VLAN`,hi:`Naye branch router ko koi VLAN nahi dikh raha`},ticket:{en:`Pinnacle Coaching, Jaipur. A new branch router was connected to the switch for router-on-a-stick. No VLAN can ping its gateway. The router's subinterfaces were checked and are correct.`,hi:`Pinnacle Coaching, Jaipur. Router-on-a-stick ke liye naya branch router switch se connect hua. Koi VLAN apna gateway ping nahi kar pa raha. Router ke subinterfaces check kiye gaye aur sahi hain.`},out:`BR-SW#show interfaces GigabitEthernet0/1 switchport | include Mode|Access
Administrative Mode: dynamic auto
Operational Mode: static access
Access Mode VLAN: 1 (default)

BR-SW#show interfaces trunk

BR-SW#`,q:{en:`What should you configure on BR-SW Gi0/1?`,hi:`BR-SW Gi0/1 par kya configure karna chahiye?`},o:[{en:`switchport mode trunk`,hi:`switchport mode trunk`},{en:`switchport mode dynamic desirable`,hi:`switchport mode dynamic desirable`},{en:`switchport access vlan 10`,hi:`switchport access vlan 10`},{en:`no switchport`,hi:`no switchport`}],a:0,w:{en:`The port is dynamic auto and a router never sends DTP, so it stays an access port in VLAN 1 and no tagged frames pass. Hard-set switchport mode trunk. Desirable also fails because the router never answers DTP. no switchport would make it a routed port and break ROAS.`,hi:`Port dynamic auto hai aur router kabhi DTP nahi bhejta, isliye woh VLAN 1 ka access port hi rehta hai aur koi tagged frame pass nahi hota. switchport mode trunk hard-set karo. Desirable bhi fail hoga kyunki router kabhi DTP ka jawab nahi deta. no switchport use routed port bana dega aur ROAS toot jaayega.`}},{title:{en:`One laptop, one problem`,hi:`Ek laptop, ek problem`},ticket:{en:`Trident Media, Mumbai. Only one editor's laptop in VLAN 40 cannot reach the render farm in VLAN 60. Other VLAN 40 laptops are fine.`,hi:`Trident Media, Mumbai. VLAN 40 mein sirf ek editor ka laptop VLAN 60 ke render farm tak nahi pahunch pa raha. Baaki VLAN 40 laptops theek hain.`},out:`C:\\> ipconfig
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . . : 10.12.40.57
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.12.60.1

C:\\> ping 10.12.40.1
Reply from 10.12.40.1: bytes=32 time=1ms TTL=255

C:\\> ping 10.12.60.25
PING: transmit failed. General failure.`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The Vlan60 SVI is down`,hi:`Vlan60 SVI down hai`},{en:`ip routing is disabled`,hi:`ip routing disabled hai`},{en:`The laptop is in the wrong VLAN`,hi:`Laptop galat VLAN mein hai`},{en:`The laptop's default gateway is in another subnet; it should be 10.12.40.1`,hi:`Laptop ka default gateway dusre subnet mein hai; 10.12.40.1 hona chahiye`}],a:3,w:{en:`The laptop reaches 10.12.40.1, so its VLAN and the SVI are fine, and other users route normally, so routing is fine. Its gateway 10.12.60.1 is off-subnet, so Windows cannot ARP for it and reports General failure. Set the gateway to 10.12.40.1 (or fix the static entry and return to DHCP).`,hi:`Laptop 10.12.40.1 tak pahunchta hai, yaani uska VLAN aur SVI theek hain, aur baaki users normal route kar rahe hain, yaani routing theek hai. Uska gateway 10.12.60.1 off-subnet hai, isliye Windows uske liye ARP nahi kar sakta aur General failure dikhata hai. Gateway 10.12.40.1 set karo (ya static entry theek karke DHCP par wapas jaao).`}},{title:{en:`A new VLAN took the whole branch down`,hi:`Ek naye VLAN ne poori branch gira di`},ticket:{en:`Vidya Coaching, Pune. An engineer added VLAN 40 for a new classroom: he created Gi0/0.40 on the router and changed the switch port facing the router. Within seconds, every VLAN lost its gateway.`,hi:`Vidya Coaching, Pune. Engineer ne nayi classroom ke liye VLAN 40 joda: router par Gi0/0.40 banaya aur router ki taraf wala switch port badla. Kuch hi seconds mein har VLAN ka gateway chala gaya.`},out:`BR-SW#show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 description TO-BR-R1
 switchport mode trunk
 switchport trunk allowed vlan 40
end

BR-SW#show interfaces trunk | include Gi0/1
Gi0/1       on               802.1q         trunking      1
Gi0/1       40
Gi0/1       40
Gi0/1       40`,q:{en:`What restores service for all VLANs?`,hi:`Saare VLANs ki service kya wapas laayega?`},o:[{en:`switchport trunk allowed vlan 10,20,30,40 (and use "add" in future changes)`,hi:`switchport trunk allowed vlan 10,20,30,40 (aur aage ke changes mein "add" use karo)`},{en:`Remove Gi0/0.40 from the router`,hi:`Router se Gi0/0.40 hatao`},{en:`switchport trunk native vlan 40`,hi:`switchport trunk native vlan 40`},{en:`Reload the router so that it relearns the VLANs`,hi:`Router reload karo taaki woh VLANs dobara seekhe`}],a:0,w:{en:`"switchport trunk allowed vlan 40" replaced the whole list, so only VLAN 40 crosses the trunk to the router. Restore every routed VLAN in the list; next time use "switchport trunk allowed vlan add 40". Removing the new subinterface, changing the native VLAN or reloading does not change the switch's allowed list.`,hi:`"switchport trunk allowed vlan 40" ne poori list replace kar di, isliye router tak trunk par sirf VLAN 40 jaata hai. List mein har routed VLAN wapas daalo; agli baar "switchport trunk allowed vlan add 40" use karo. Naya subinterface hatane, native VLAN badalne ya reload karne se switch ki allowed list nahi badalti.`}},{title:{en:`New lab VLAN gets 169.254 addresses`,hi:`Naye lab VLAN ko 169.254 addresses milte hain`},ticket:{en:`Sunrise Engineering College, Nagpur. VLAN 50 was added for a new computer lab with SVI 10.9.50.1 on the core switch and a scope 10.9.50.0/24 on the DHCP server 10.9.200.5. Every lab PC shows a 169.254 address. All other VLANs get DHCP normally.`,hi:`Sunrise Engineering College, Nagpur. Nayi computer lab ke liye VLAN 50 joda gaya, core switch par SVI 10.9.50.1 aur DHCP server 10.9.200.5 par scope 10.9.50.0/24 ke saath. Lab ke har PC par 169.254 address dikhta hai. Baaki saare VLANs ko DHCP normal milta hai.`},out:`CORE#show ip interface brief | include Vlan50|Vlan40
Vlan40                 10.9.40.1       YES NVRAM  up                    up
Vlan50                 10.9.50.1       YES manual up                    up

CORE#show ip interface Vlan40 | include Helper
  Helper address is 10.9.200.5

CORE#show ip interface Vlan50 | include Helper
  Helper address is not set`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Enable ip routing on the core switch`,hi:`Core switch par ip routing enable karo`},{en:`Configure ip helper-address on the DHCP server's VLAN SVI`,hi:`DHCP server ke VLAN SVI par ip helper-address configure karo`},{en:`Add ip helper-address 10.9.200.5 under interface Vlan50`,hi:`interface Vlan50 ke andar ip helper-address 10.9.200.5 jodo`},{en:`no shutdown on Vlan50`,hi:`Vlan50 par no shutdown`}],a:2,w:{en:`Vlan50 is up/up and routing works for other VLANs, but VLAN 50 has no relay, so the DHCP Discover broadcast never leaves the VLAN and clients fall back to APIPA. The helper belongs on the interface that receives the client broadcast, Vlan50, not on the server's VLAN.`,hi:`Vlan50 up/up hai aur dusre VLANs ke liye routing chal rahi hai, lekin VLAN 50 par relay nahi, isliye DHCP Discover broadcast kabhi VLAN se bahar nahi jaata aur clients APIPA par gir jaate hain. Helper us interface par lagta hai jo client broadcast receive karta hai, yaani Vlan50, server ke VLAN par nahi.`}},{title:{en:`Campus routes internally but has no internet`,hi:`Campus andar route karta hai lekin internet nahi`},ticket:{en:`Greenfield Logistics, Chennai. The new distribution switch DSW1 routes between VLAN 10 and VLAN 20 correctly. From DSW1 itself, pings to the internet test address 203.0.113.1 succeed, but from PC1 (10.1.10.50) they all time out.`,hi:`Greenfield Logistics, Chennai. Naya distribution switch DSW1 VLAN 10 aur VLAN 20 ke beech sahi route karta hai. DSW1 se khud internet test address 203.0.113.1 ke pings chalte hain, lekin PC1 (10.1.10.50) se sab time out hote hain.`},out:`DSW1#show ip route static
S*    0.0.0.0/0 [1/0] via 10.1.99.2

DSW1#ping 203.0.113.1
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms

EDGE#show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.1.99.0/30 is directly connected, GigabitEthernet0/0
L        10.1.99.2/32 is directly connected, GigabitEthernet0/0
      203.0.113.0/32 is subnetted, 1 subnets
C        203.0.113.1 is directly connected, Loopback0`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A default route on DSW1`,hi:`DSW1 par default route`},{en:`A return route on EDGE: ip route 10.1.0.0 255.255.0.0 10.1.99.1`,hi:`EDGE par return route: ip route 10.1.0.0 255.255.0.0 10.1.99.1`},{en:`no switchport on EDGE Gi0/0`,hi:`EDGE Gi0/0 par no switchport`},{en:`ip helper-address on Vlan10`,hi:`Vlan10 par ip helper-address`}],a:1,w:{en:`DSW1 has its default route, and its own pings work because they are sourced from 10.1.99.1, a subnet EDGE knows. Packets from 10.1.10.50 reach EDGE, but EDGE has no route back to 10.1.10.0/24. Add the summary return route towards DSW1. EDGE is a router, so switchport commands do not apply, and DHCP relay is unrelated.`,hi:`DSW1 ke paas default route hai, aur uske apne pings chalte hain kyunki woh 10.1.99.1 se sourced hain, jo subnet EDGE jaanta hai. 10.1.10.50 ke packets EDGE tak pahunchte hain, lekin EDGE ke paas 10.1.10.0/24 ka wapsi route nahi. DSW1 ki taraf summary return route jodo. EDGE router hai, isliye switchport commands apply nahi hoti, aur DHCP relay ka isse lena dena nahi.`}}];export{e as default};