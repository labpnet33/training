var e=[{title:{en:`EDGE shows UNKNOWN in the NMS`,hi:`NMS mein EDGE UNKNOWN dikhata hai`},ticket:{en:`Ticket NK-4471: the NMS 10.99.0.50 cannot poll Mumbai EDGE with community NOC-RO for three days. The community string was copied from the password vault and is correct. You check EDGE.`,hi:`Ticket NK-4471: NMS 10.99.0.50 teen din se Mumbai EDGE ko community NOC-RO se poll nahi kar pa raha. Community string password vault se copy ki gayi hai aur sahi hai. Aap EDGE check karte ho.`},out:`EDGE# show snmp | include packets|community
37 SNMP packets input
    37 Unknown community name
    0 Illegal operation for community name supplied
0 SNMP packets output

EDGE# show snmp community
Community name: NOC-RO
Community Index: NOC-RO
Community SecurityName: NOC-RO
storage-type: nonvolatile        active access-list: 20

EDGE# show access-lists 20
Standard IP access list 20
    10 permit 10.99.0.5`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`The NMS is using SNMPv1 instead of v2c`,hi:`NMS v2c ki jagah SNMPv1 use kar raha hai`},{en:`UDP 161 is blocked on the path to EDGE`,hi:`EDGE tak path par UDP 161 block hai`},{en:`ACL 20 permits 10.99.0.5, not the NMS 10.99.0.50, so every poll is refused`,hi:`ACL 20 10.99.0.5 ko permit karta hai, NMS 10.99.0.50 ko nahi, isliye har poll refuse hota hai`},{en:`The community must be RW for the NMS to read sysName`,hi:`NMS ko sysName padhne ke liye community RW honi chahiye`}],a:2,w:{en:`Polls arrive (input 37) so the path is fine, and every one is counted as Unknown community name with no output. A source denied by the community ACL is counted exactly like a wrong string. Fix: access-list 20 permit host 10.99.0.50; the user LAN stays refused. Read the address in the ACL digit by digit: .5 is not .50.`,hi:`Polls pahunchte hain (input 37) isliye path theek hai, aur har ek bina output ke Unknown community name mein gina jaata hai. Community ACL se deny hua source bilkul galat string ki tarah gina jaata hai. Fix: access-list 20 permit host 10.99.0.50; user LAN refuse hi rehta hai. ACL ka address ek ek digit padho: .5 aur .50 alag hain.`}},{title:{en:`Failover happened but the NOC saw nothing`,hi:`Failover hua par NOC ko kuch nahi dikha`},ticket:{en:`During a provider outage, BR failed over to PE2 correctly, but the NOC syslog collector 10.10.10.50 received no TRACK messages. Interface up/down messages from BR do appear on the collector.`,hi:`Provider outage ke dauraan BR sahi tarah PE2 par fail over hua, par NOC syslog collector 10.10.10.50 ko koi TRACK messages nahi mile. BR ke interface up/down messages collector par dikhte hain.`},out:`BR# show logging | include Trap|Logging to|link
    Trap logging: level notifications, 212 message lines logged
        Logging to 10.10.10.50  (udp port 514, audit disabled,
              link up),

BR# show logging | include TRACK
Sep 30 10:00:15.231 IST: %TRACK-6-STATE: 10 ip sla 10 reachability Up -> Down
Sep 30 10:14:41.902 IST: %TRACK-6-STATE: 10 ip sla 10 reachability Down -> Up`,q:{en:`Why are the TRACK messages missing on the collector?`,hi:`Collector par TRACK messages kyun missing hain?`},o:[{en:`The trap level is notifications (5); %TRACK-6-STATE is severity 6 and is filtered`,hi:`Trap level notifications (5) hai; %TRACK-6-STATE severity 6 hai aur filter ho jaata hai`},{en:`The collector has no route back to BR`,hi:`Collector ke paas BR tak wapas route nahi hai`},{en:`TRACK messages are only sent as SNMP traps`,hi:`TRACK messages sirf SNMP traps ki tarah jaate hain`},{en:`The buffer is too small`,hi:`Buffer bahut chhota hai`}],a:0,w:{en:`The messages exist in the local buffer, and other messages reach the server (link up, counter growing), so routing is fine. The trap level notifications sends 0 to 5 only. Fix: logging trap informational.`,hi:`Messages local buffer mein hain, aur doosre messages server tak pahunchte hain (link up, badhta counter), isliye routing theek hai. Trap level notifications sirf 0 se 5 bhejta hai. Fix: logging trap informational.`}},{title:{en:`Nagpur PCs cannot find a DHCP server`,hi:`Nagpur PCs ko DHCP server nahi mil raha`},ticket:{en:`After a migration, PCs on 192.168.50.0/24 report "Can't find dhcp server". The central server is HQ 10.30.30.1. HQ's DHCP statistics show no DISCOVER messages received from the branch.`,hi:`Migration ke baad 192.168.50.0/24 ke PCs "Can't find dhcp server" report karte hain. Central server HQ 10.30.30.1 hai. HQ ke DHCP statistics mein branch se koi DISCOVER message nahi mila.`},out:`BR# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.50.1    YES manual up                    up
GigabitEthernet0/1     10.20.20.1      YES manual up                    up

BR# show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 ip address 10.20.20.1 255.255.255.252
 ip helper-address 10.30.30.1
end

BR# show ip interface GigabitEthernet0/0 | include Helper
  Helper address is not set`,q:{en:`What should you change first?`,hi:`Aapko sabse pehle kya badalna chahiye?`},o:[{en:`Add a DHCP pool on BR`,hi:`BR par DHCP pool jodo`},{en:`Move ip helper-address 10.30.30.1 from Gi0/1 to Gi0/0, where the client broadcasts arrive`,hi:`ip helper-address 10.30.30.1 ko Gi0/1 se Gi0/0 par le jao, jahan client broadcasts aate hain`},{en:`Add ip forward-protocol udp bootps on BR`,hi:`BR par ip forward-protocol udp bootps jodo`},{en:`Change the helper to the broadcast address 10.30.30.255`,hi:`Helper ko broadcast address 10.30.30.255 par badlo`}],a:1,w:{en:`Broadcasts arrive on Gi0/0 and are never converted, because the helper is on the WAN link. With the helper on Gi0/0, BR relays with giaddr 192.168.50.1. BOOTP/DHCP is already forwarded by default, and a directed broadcast helper is neither needed nor a good practice.`,hi:`Broadcasts Gi0/0 par aate hain aur kabhi convert nahi hote, kyunki helper WAN link par hai. Gi0/0 par helper ke saath BR giaddr 192.168.50.1 ke saath relay karta hai. BOOTP/DHCP default mein pehle se forward hota hai, aur directed broadcast helper na zaroori hai na achhi practice.`}},{title:{en:`Server sees the DISCOVER, client gets nothing`,hi:`Server ko DISCOVER dikhta hai, client ko kuch nahi milta`},ticket:{en:`The helper on BR is now correct. Clients still get no address. You run a DHCP debug on HQ and check its routing.`,hi:`BR par helper ab sahi hai. Clients ko phir bhi address nahi milta. Aap HQ par DHCP debug chalate ho aur uski routing check karte ho.`},out:`HQ# debug ip dhcp server packet
DHCPD: DHCPDISCOVER received from client 0100.5079.6668.01 through relay 192.168.50.1.
DHCPD: Sending DHCPOFFER to client 0100.5079.6668.01 (192.168.50.11).
DHCPD: unicasting BOOTREPLY for client 0050.7966.6801 to relay 192.168.50.1.

HQ# show ip route 192.168.50.1
% Network not in table

HQ# show ip route static
Gateway of last resort is not set`,q:{en:`Why do the clients not receive the OFFER?`,hi:`Clients ko OFFER kyun nahi milta?`},o:[{en:`The pool BR-LAN does not exist`,hi:`Pool BR-LAN exist nahi karta`},{en:`The client MAC is excluded`,hi:`Client MAC excluded hai`},{en:`The helper must point to 10.20.20.2`,hi:`Helper ko 10.20.20.2 ki taraf point karna chahiye`},{en:`HQ has no route to the giaddr 192.168.50.1, so the unicast OFFER is dropped`,hi:`HQ ke paas giaddr 192.168.50.1 tak route nahi, isliye unicast OFFER drop ho jaata hai`}],a:3,w:{en:`The debug proves the pool exists (an OFFER with 192.168.50.11 is built). The reply is unicast to the relay address, and HQ has no route to it. Fix: ip route 192.168.50.0 255.255.255.0 10.20.20.1.`,hi:`Debug sabit karta hai ki pool exist karta hai (192.168.50.11 ke saath OFFER banta hai). Reply relay address par unicast hota hai, aur HQ ke paas uska route nahi. Fix: ip route 192.168.50.0 255.255.255.0 10.20.20.1.`}},{title:{en:`The tracked route flaps every few seconds`,hi:`Tracked route har kuch second mein flap karta hai`},ticket:{en:`While PE1's core link is down, BR's log shows track 10 going Down and Up repeatedly, and users on 192.168.40.0/24 see intermittent loss to 10.10.10.0/24.`,hi:`Jab PE1 ka core link down hai, BR ka log track 10 ko baar-baar Down aur Up hota dikhata hai, aur 192.168.40.0/24 ke users ko 10.10.10.0/24 tak beech beech mein loss dikhta hai.`},out:`BR# show running-config | include ip sla|icmp-echo|ip route|track
ip sla 10
 icmp-echo 10.10.10.1
ip sla schedule 10 life forever start-time now
track 10 ip sla 10 reachability
ip route 10.10.10.0 255.255.255.0 10.1.1.1 track 10
ip route 10.10.10.0 255.255.255.0 10.2.2.1 250

BR# show ip route 10.10.10.1
Routing entry for 10.10.10.0/24
  Known via "static", distance 250, metric 0
  Routing Descriptor Blocks:
  * 10.2.2.1
      Route metric is 0, traffic share count is 1`,q:{en:`What is the best fix?`,hi:`Sabse achha fix kya hai?`},o:[{en:`Lower the floating route AD to 1`,hi:`Floating route ka AD 1 kar do`},{en:`Change the track to state instead of reachability`,hi:`Track ko reachability ki jagah state kar do`},{en:`Pin the probe with ip route 10.10.10.1 255.255.255.255 10.1.1.1 and source it from Gi0/1; add delay down/up`,hi:`ip route 10.10.10.1 255.255.255.255 10.1.1.1 se probe pin karo aur Gi0/1 se source karo; delay down/up jodo`},{en:`Increase the SLA frequency to 60 seconds`,hi:`SLA frequency 60 second kar do`}],a:2,w:{en:`The probe target now resolves via the backup (distance 250 via 10.2.2.1), so it succeeds, the track comes Up, the primary is reinstalled and fails again. A /32 through PE1 and a source interface keep the probe on the protected path; delay down/up dampens the remaining transitions.`,hi:`Probe target ab backup se resolve hota hai (10.2.2.1 ke through distance 250), isliye safal hota hai, track Up hota hai, primary wapas install hota hai aur phir fail hota hai. PE1 ke through /32 aur source interface probe ko protected path par rakhte hain; delay down/up baaki transitions ko dabata hai.`}},{title:{en:`Flow collector stays empty`,hi:`Flow collector khaali rehta hai`},ticket:{en:`Flexible NetFlow monitor NOC-MON was configured on EDGE to see user traffic from 192.168.60.0/24 toward the internet. Users generate plenty of traffic, but the collector at 10.99.0.50 shows nothing and the cache is empty.`,hi:`EDGE par 192.168.60.0/24 se internet ki taraf user traffic dekhne ke liye Flexible NetFlow monitor NOC-MON configure kiya gaya. Users kaafi traffic bana rahe hain, par 10.99.0.50 ka collector kuch nahi dikhata aur cache khaali hai.`},out:`EDGE# show flow interface
Interface GigabitEthernet0/2
  FNF:  monitor:         NOC-MON
        direction:       Output
        traffic(ip):     on

EDGE# show flow monitor NOC-MON cache format table
  Cache type:                               Normal (Platform cache)
  Cache size:                                 4096
  Current entries:                               0

EDGE# show ip interface brief | include Gigabit
GigabitEthernet0/0     192.168.60.1    YES manual up                    up
GigabitEthernet0/1     100.64.60.2     YES manual up                    up
GigabitEthernet0/2     10.99.0.1       YES manual up                    up`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The monitor is applied output on Gi0/2 (the NMS link); it should be input on Gi0/0, the user LAN`,hi:`Monitor Gi0/2 (NMS link) par output laga hai; ise Gi0/0, user LAN par input hona chahiye`},{en:`The exporter uses the wrong UDP port`,hi:`Exporter galat UDP port use karta hai`},{en:`The record is missing collect counter bytes`,hi:`Record mein collect counter bytes missing hai`},{en:`NetFlow cannot see ICMP`,hi:`NetFlow ICMP nahi dekh sakta`}],a:0,w:{en:`An empty cache means nothing is being metered, which is an interface or direction problem, not an export problem. User traffic enters Gi0/0 and leaves Gi0/1; it never leaves Gi0/2. Fix: no ip flow monitor NOC-MON output on Gi0/2, ip flow monitor NOC-MON input on Gi0/0.`,hi:`Khaali cache ka matlab kuch meter nahi ho raha, jo interface ya direction problem hai, export problem nahi. User traffic Gi0/0 par aata hai aur Gi0/1 se jaata hai; Gi0/2 se kabhi nahi nikalta. Fix: Gi0/2 par no ip flow monitor NOC-MON output, Gi0/0 par ip flow monitor NOC-MON input.`}},{title:{en:`SNMPv3 poll refused with the right passwords`,hi:`Sahi passwords ke saath SNMPv3 poll refuse`},ticket:{en:`The NMS team migrated EDGE to SNMPv3. Their poller is configured with user nocuser, SHA and the correct authentication password, and security level authNoPriv. Every poll fails with an authorization error.`,hi:`NMS team ne EDGE ko SNMPv3 par migrate kiya. Unka poller user nocuser, SHA aur sahi authentication password, aur security level authNoPriv ke saath configure hai. Har poll authorization error ke saath fail hota hai.`},out:`EDGE# show snmp user
User name: nocuser
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
Authentication Protocol: SHA
Privacy Protocol: AES128
Group-name: NOC

EDGE# show snmp group
groupname: NOC                              security model:v3 priv
storage-type: nonvolatile
readview : NOCVIEW
row status: active      access-list: 20`,q:{en:`What should the NMS team change?`,hi:`NMS team ko kya badalna chahiye?`},o:[{en:`Use MD5 instead of SHA`,hi:`SHA ki jagah MD5 use karo`},{en:`Poll with authPriv and the AES privacy password, because group NOC requires priv`,hi:`authPriv aur AES privacy password ke saath poll karo, kyunki group NOC priv maangta hai`},{en:`Re-create the engine ID`,hi:`Engine ID dobara banao`},{en:`Add the user to the running-config`,hi:`User ko running-config mein jodo`}],a:1,w:{en:`The group is v3 priv, so requests must be authPriv. authNoPriv is below the group level and is refused even with a correct password. Users never appear in the running-config; show snmp user already proves the user exists.`,hi:`Group v3 priv hai, isliye requests authPriv honi chahiye. authNoPriv group level se kam hai aur sahi password ke saath bhi refuse hoti hai. Users kabhi running-config mein nahi dikhte; show snmp user pehle hi sabit karta hai ki user exist karta hai.`}},{title:{en:`IPv6 clients never ask the DHCPv6 server`,hi:`IPv6 clients kabhi DHCPv6 server se nahi poochte`},ticket:{en:`The branch should use stateful DHCPv6 from the central server 2001:db8:30::1. Clients on 2001:db8:50::/64 have SLAAC addresses but no DNS, and the server has no bindings for them. You check the branch router.`,hi:`Branch ko central server 2001:db8:30::1 se stateful DHCPv6 use karna chahiye. 2001:db8:50::/64 ke clients ke paas SLAAC addresses hain par DNS nahi, aur server par unki koi binding nahi. Aap branch router check karte ho.`},out:`BR# show ipv6 dhcp interface
GigabitEthernet0/0 is in relay mode
  Relay destinations:
    2001:DB8:30::1

BR# show ipv6 interface GigabitEthernet0/0 | include Hosts|ND
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 30000)
  ND advertised reachable time is 0 (unspecified)
  ND advertised retransmit interval is 0 (unspecified)
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  ND advertised default router preference is Medium
  Hosts use stateless autoconfig for addresses.`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`ip helper-address 2001:db8:30::1 on Gi0/0`,hi:`Gi0/0 par ip helper-address 2001:db8:30::1`},{en:`A default-router option in the DHCPv6 pool`,hi:`DHCPv6 pool mein default-router option`},{en:`ipv6 dhcp server on the branch router`,hi:`Branch router par ipv6 dhcp server`},{en:`ipv6 nd managed-config-flag on Gi0/0, so the RA tells clients to use stateful DHCPv6`,hi:`Gi0/0 par ipv6 nd managed-config-flag, taaki RA clients ko stateful DHCPv6 use karne ko kahe`}],a:3,w:{en:`The relay is correct, but the RA from BR does not set the M flag ("Hosts use stateless autoconfig"), so clients never send SOLICIT. Add ipv6 nd managed-config-flag. IPv6 has no helper-address and DHCPv6 has no gateway option; the gateway comes from the RA.`,hi:`Relay sahi hai, par BR ka RA M flag set nahi karta ("Hosts use stateless autoconfig"), isliye clients kabhi SOLICIT nahi bhejte. ipv6 nd managed-config-flag jodo. IPv6 mein helper-address nahi hota aur DHCPv6 mein gateway option nahi; gateway RA se aata hai.`}}];export{e as default};