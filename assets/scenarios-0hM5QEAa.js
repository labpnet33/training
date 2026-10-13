var e=[{title:{en:`RSPAN copies never reach the analyser`,hi:`RSPAN copies analyser tak kabhi nahi pahunchti`},ticket:{en:`RSPAN over VLAN 999 was built from SW1 (source) through SW2 to SW3 (destination, ANALYZER on Gi0/7). show monitor looks correct on SW1 and SW3, but the analyser receives nothing. You check the transit switch.`,hi:`SW1 (source) se SW2 ke through SW3 (destination, Gi0/7 par ANALYZER) tak VLAN 999 par RSPAN banaya gaya. SW1 aur SW3 par show monitor sahi dikhta hai, par analyser ko kuch nahi milta. Aap transit switch check karte ho.`},out:`SW2# show vlan remote-span

Remote SPAN VLANs
------------------------------------------------------------------------------
999

SW2# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1
Gi0/1       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/0       10,999
Gi0/1       10

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/0       10,999
Gi0/1       10`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`SW2 needs its own monitor session for VLAN 999`,hi:`SW2 ko VLAN 999 ke liye apna monitor session chahiye`},{en:`VLAN 999 is not marked remote-span on SW2`,hi:`SW2 par VLAN 999 remote-span marked nahi hai`},{en:`Trunk Gi0/1 towards SW3 does not allow VLAN 999`,hi:`SW3 ki taraf trunk Gi0/1 VLAN 999 allow nahi karta`},{en:`The session numbers on SW1 and SW3 must match`,hi:`SW1 aur SW3 par session numbers match hone chahiye`}],a:2,w:{en:`SW2 knows VLAN 999 as remote-span, but "Vlans allowed on trunk" for Gi0/1 lists only 10, so the copies stop at SW2. Fix: interface g0/1, switchport trunk allowed vlan add 999. Transit switches need the VLAN and the trunks, never a session, and session numbers are local.`,hi:`SW2 VLAN 999 ko remote-span ke roop mein jaanta hai, par Gi0/1 ke "Vlans allowed on trunk" mein sirf 10 hai, isliye copies SW2 par ruk jaati hain. Fix: interface g0/1, switchport trunk allowed vlan add 999. Transit switches ko VLAN aur trunks chahiye, session kabhi nahi, aur session numbers local hote hain.`}},{title:{en:`ERSPAN sensor stays silent`,hi:`ERSPAN sensor chup rehta hai`},ticket:{en:`SW1 mirrors PC1 with ERSPAN to R2 (192.0.2.50), which should deliver the frames to the IDS on Gi0/2. SW1 can ping 192.0.2.50 from 172.16.1.1, and a capture on the R1-R2 link shows GRE packets. The IDS still sees nothing.`,hi:`SW1 PC1 ko ERSPAN se R2 (192.0.2.50) tak mirror karta hai, jise frames Gi0/2 par IDS ko dene chahiye. SW1 172.16.1.1 se 192.0.2.50 ping kar sakta hai, aur R1-R2 link ke capture mein GRE packets dikhte hain. IDS ko phir bhi kuch nahi dikhta.`},out:`SW1# show monitor session 10
Session 10
----------
Type                   : ERSPAN Source Session
Status                 : Admin Enabled
Source Ports           :
    Both               : Gi0/1
Destination IP Address : 192.0.2.50
Origin IP Address      : 172.16.1.1
ERSPAN ID              : 77

R2# show monitor session 20
Session 20
----------
Type                   : ERSPAN Destination Session
Status                 : Admin Enabled
Destination Ports      : Gi0/2
Source IP Address      : 192.0.2.50
ERSPAN ID              : 78`,q:{en:`Why does the IDS receive nothing?`,hi:`IDS ko kuch kyun nahi milta?`},o:[{en:`The ERSPAN IDs do not match (77 on SW1, 78 on R2)`,hi:`ERSPAN IDs match nahi karte (SW1 par 77, R2 par 78)`},{en:`The session numbers 10 and 20 must be the same`,hi:`Session numbers 10 aur 20 same hone chahiye`},{en:`R2 session is still shut down`,hi:`R2 session abhi bhi shut down hai`},{en:`GRE is blocked between SW1 and R2`,hi:`SW1 aur R2 ke beech GRE blocked hai`}],a:0,w:{en:`Both sessions are Admin Enabled and GRE is seen on the path, so transport and state are fine. The destination session accepts only packets carrying its own ERSPAN ID; 77 versus 78 means every copy is discarded. Set erspan-id 77 under the source sub-mode on R2. Session numbers are local.`,hi:`Dono sessions Admin Enabled hain aur path par GRE dikhta hai, isliye transport aur state theek hain. Destination session sirf apni ERSPAN ID wale packets accept karta hai; 77 versus 78 ka matlab har copy discard hoti hai. R2 par source sub-mode mein erspan-id 77 set karo. Session numbers local hote hain.`}},{title:{en:`Traffic never uses the primary ISP`,hi:`Traffic kabhi primary ISP use nahi karta`},ticket:{en:`After configuring IP SLA tracking on EDGE, all internet traffic goes through ISP2 even though ISP1 is healthy. The engineer insists the IP SLA and track are configured.`,hi:`EDGE par IP SLA tracking configure karne ke baad saara internet traffic ISP2 se jaata hai jabki ISP1 bilkul theek hai. Engineer kehta hai ki IP SLA aur track configured hain.`},out:`EDGE# show ip sla statistics 1
IPSLAs Latest Operation Statistics

IPSLA operation id: 1
Latest operation start time: Unknown
Latest operation return code: Unknown
Number of successes: Unknown
Number of failures: Unknown
Operation time to live: 0

EDGE# show track 1
Track 1
  IP SLA 1 reachability
  Reachability is Down
    1 change, last change 00:12:40
  Delay up 10 secs, down 5 secs
  Latest operation return code: Unknown
  Tracked by:
    Static IP Routing 0

EDGE# show ip route static
S*    0.0.0.0/0 [10/0] via 10.0.2.1`,q:{en:`What is missing?`,hi:`Kya gayab hai?`},o:[{en:`The floating route needs a lower administrative distance`,hi:`Floating route ko kam administrative distance chahiye`},{en:`The track must use state instead of reachability`,hi:`Track ko reachability ki jagah state use karna chahiye`},{en:`ISP1 must run ip sla responder`,hi:`ISP1 par ip sla responder chalna chahiye`},{en:`The IP SLA operation was never scheduled`,hi:`IP SLA operation kabhi schedule hi nahi hua`}],a:3,w:{en:`"Unknown" statistics and a time to live of 0 mean the operation never started. With no successful probes, track 1 stays Down, so the tracked primary route is withdrawn and only the AD 10 backup remains. Fix: ip sla schedule 1 life forever start-time now. icmp-echo needs no responder.`,hi:`"Unknown" statistics aur time to live 0 ka matlab operation kabhi shuru hi nahi hua. Koi successful probe na hone se track 1 Down rehta hai, isliye tracked primary route hat jaata hai aur sirf AD 10 wala backup bachta hai. Fix: ip sla schedule 1 life forever start-time now. icmp-echo ko responder nahi chahiye.`}},{title:{en:`Internet comes and goes during an ISP1 outage`,hi:`ISP1 outage mein internet aata jaata hai`},ticket:{en:`During an ISP1 upstream outage, Chennai users report that internet access works for about 20 seconds, then fails, then works again. ISP2 is healthy.`,hi:`ISP1 upstream outage ke dauran Chennai users report karte hain ki internet lagbhag 20 second chalta hai, phir fail hota hai, phir chalta hai. ISP2 theek hai.`},out:`EDGE# show logging | include TRACK
*Sep 30 14:19:45.211: %TRACK-6-STATE: 1 ip sla 1 reachability Up -> Down
*Sep 30 14:20:01.402: %TRACK-6-STATE: 1 ip sla 1 reachability Down -> Up
*Sep 30 14:20:11.530: %TRACK-6-STATE: 1 ip sla 1 reachability Up -> Down
*Sep 30 14:20:27.644: %TRACK-6-STATE: 1 ip sla 1 reachability Down -> Up

EDGE# show running-config | include ip route
ip route 0.0.0.0 0.0.0.0 10.0.1.1 track 1
ip route 0.0.0.0 0.0.0.0 10.0.2.1 10`,q:{en:`What causes the flapping?`,hi:`Flapping ki wajah kya hai?`},o:[{en:`The delay up timer is too long`,hi:`Delay up timer bahut lamba hai`},{en:`There is no /32 route pinning the probe target 203.0.113.53 to ISP1, so the probe follows the default route to ISP2 after failover`,hi:`Probe target 203.0.113.53 ko ISP1 par pin karne wala /32 route nahi hai, isliye failover ke baad probe default route ke peeche ISP2 par jaata hai`},{en:`The floating route has the wrong next hop`,hi:`Floating route ka next hop galat hai`},{en:`The probe uses the wrong source-interface`,hi:`Probe galat source-interface use karta hai`}],a:1,w:{en:`Only the two default routes exist. When the track goes Down, the default moves to ISP2, the probe follows it, succeeds, the track comes Up, traffic moves back to the dead ISP1, and the cycle repeats. source-interface sets only the source address, not the path. Add ip route 203.0.113.53 255.255.255.255 10.0.1.1.`,hi:`Sirf do default routes hain. Track Down hone par default ISP2 par jaata hai, probe uske peeche jaakar succeed karta hai, track Up hota hai, traffic dead ISP1 par laut aata hai, aur cycle dohrata hai. source-interface sirf source address set karta hai, path nahi. ip route 203.0.113.53 255.255.255.255 10.0.1.1 jodo.`}},{title:{en:`The IDS sees only replies from the server`,hi:`IDS ko server se sirf replies dikhte hain`},ticket:{en:`A new IDS on SW1 Gi0/7 should watch everything SRV1 (Gi0/3) sends and receives. The IDS team says it sees traffic leaving towards SRV1 but never the requests SRV1 itself sends.`,hi:`SW1 Gi0/7 par naya IDS SRV1 (Gi0/3) ka bheja aur receive kiya sab dekhna chahiye. IDS team kehti hai use SRV1 ki taraf jaata traffic dikhta hai par SRV1 ki khud ki bheji requests kabhi nahi.`},out:`SW1# show monitor session 1
Session 1
---------
Type                     : Local Session
Source Ports             :
    TX Only              : Gi0/3
Destination Ports        : Gi0/7
    Encapsulation        : Native
          Ingress        : Disabled`,q:{en:`What should be changed?`,hi:`Kya badalna chahiye?`},o:[{en:`Enable ingress on the destination port`,hi:`Destination port par ingress enable karo`},{en:`Use encapsulation replicate`,hi:`encapsulation replicate use karo`},{en:`Monitor Gi0/3 in both directions (the default), not tx only`,hi:`Gi0/3 ko dono directions (default) mein monitor karo, sirf tx nahi`},{en:`Move the IDS to an RSPAN VLAN`,hi:`IDS ko RSPAN VLAN par le jao`}],a:2,w:{en:`tx means frames the switch sends out of Gi0/3, which are frames going to SRV1. Frames SRV1 sends are received by the switch (rx). Re-enter monitor session 1 source interface g0/3 without a keyword (both). Ingress only lets the IDS send traffic into the port.`,hi:`tx ka matlab woh frames jo switch Gi0/3 se bahar bhejta hai, yaani SRV1 ki taraf jaane wale frames. SRV1 ke bheje frames switch receive karta hai (rx). monitor session 1 source interface g0/3 bina keyword (both) ke dobara do. Ingress sirf IDS ko port mein traffic bhejne deta hai.`}},{title:{en:`Debug is on, but the buffer stays empty`,hi:`Debug on hai, par buffer khaali rehta hai`},ticket:{en:`An engineer followed the safe-debug procedure: console logging off, conditional debug on Gi0/1, debug ip ospf hello enabled. show debugging lists the debug, but show logging shows no OSPF messages at all.`,hi:`Ek engineer ne safe-debug procedure follow kiya: console logging off, Gi0/1 par conditional debug, debug ip ospf hello enabled. show debugging debug list karta hai, par show logging mein koi OSPF message nahi.`},out:`R1# show logging
Syslog logging: enabled (0 messages dropped, 0 messages rate-limited, 0 flushes, 0 overruns, xml disabled, filtering disabled)
    Console logging: disabled
    Monitor logging: level debugging, 0 messages logged, xml disabled,
                     filtering disabled
    Buffer logging:  level informational, 214 messages logged, xml disabled,
                     filtering disabled
    Trap logging: level informational, 218 message lines logged

R1# show debug condition
Condition 1: interface Gi0/1 (1 flags triggered)
        Flags: Gi0/1`,q:{en:`Why are the debug messages missing from the buffer?`,hi:`Debug messages buffer se gayab kyun hain?`},o:[{en:`The buffer is set to informational (6), and debug output is severity 7`,hi:`Buffer informational (6) par set hai, aur debug output severity 7 hai`},{en:`The condition blocks all OSPF output`,hi:`Condition saara OSPF output block karti hai`},{en:`terminal monitor must be enabled for the buffer to work`,hi:`Buffer chalne ke liye terminal monitor enable hona chahiye`},{en:`debug ip ospf hello is not condition-aware`,hi:`debug ip ospf hello condition-aware nahi hai`}],a:0,w:{en:`"Buffer logging: level informational" stores only levels 0 to 6. Debug messages are level 7. Set logging buffered 64000 debugging. terminal monitor affects only VTY sessions, not the buffer, and the condition shows a flag triggered, so it is working.`,hi:`"Buffer logging: level informational" sirf levels 0 se 6 store karta hai. Debug messages level 7 hain. logging buffered 64000 debugging set karo. terminal monitor sirf VTY sessions par asar karta hai, buffer par nahi, aur condition mein flag triggered dikhta hai, isliye woh kaam kar rahi hai.`}},{title:{en:`NetFlow misses all LAN users`,hi:`NetFlow saare LAN users ko miss karta hai`},ticket:{en:`Flexible NetFlow was deployed on EDGE to find which LAN users (192.168.50.0/24) consume the internet link. The collector shows only flows sourced from internet servers, never from the LAN hosts.`,hi:`EDGE par Flexible NetFlow deploy kiya gaya taaki pata chale kaunse LAN users (192.168.50.0/24) internet link khaate hain. Collector sirf internet servers se source hue flows dikhata hai, LAN hosts se kabhi nahi.`},out:`EDGE# show flow interface GigabitEthernet0/2
Interface GigabitEthernet0/2
  FNF:  monitor:         NK-MON
        direction:       Output
        traffic(ip):     on

EDGE# show flow exporter statistics
Flow Exporter NK-EXP:
  Packet send statistics (last cleared 00:41:10 ago):
    Successfully sent:         1284                  (1712220 bytes)`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Change the export protocol to IPFIX`,hi:`Export protocol ko IPFIX mein badlo`},{en:`Add source Loopback0 to the exporter`,hi:`Exporter mein source Loopback0 jodo`},{en:`Add collect counter bytes long to the record`,hi:`Record mein collect counter bytes long jodo`},{en:`Apply the monitor on Gi0/2 in the input direction`,hi:`Monitor ko Gi0/2 par input direction mein apply karo`}],a:3,w:{en:`Gi0/2 is the LAN interface. Output on Gi0/2 sees only traffic going towards the LAN (sourced from internet servers). The exporter is sending successfully, so identity and transport are fine. Use no ip flow monitor NK-MON output, then ip flow monitor NK-MON input.`,hi:`Gi0/2 LAN interface hai. Gi0/2 par output sirf LAN ki taraf jaata traffic dekhta hai (internet servers se source hua). Exporter successfully bhej raha hai, isliye identity aur transport theek hain. no ip flow monitor NK-MON output, phir ip flow monitor NK-MON input use karo.`}},{title:{en:`NMS cannot poll after hardening`,hi:`Hardening ke baad NMS poll nahi kar pata`},ticket:{en:`After SNMP hardening on EDGE, the NMS at 192.0.2.25 reports "authorization error" for user nmsuser. The NMS profile is set to SNMPv3, SHA authentication, no privacy.`,hi:`EDGE par SNMP hardening ke baad 192.0.2.25 wala NMS user nmsuser ke liye "authorization error" report karta hai. NMS profile SNMPv3, SHA authentication, bina privacy par set hai.`},out:`EDGE# show snmp group
groupname: NMS-GRP                          security model:v3 priv
readview : NK-VIEW
row status: active      access-list: 99

EDGE# show snmp user
User name: nmsuser
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
Authentication Protocol: SHA
Privacy Protocol: AES128
Group-name: NMS-GRP`,q:{en:`What is the problem?`,hi:`Problem kya hai?`},o:[{en:`ACL 99 blocks the NMS`,hi:`ACL 99 NMS ko block karta hai`},{en:`The group requires authPriv, but the NMS uses authNoPriv`,hi:`Group authPriv maangta hai, par NMS authNoPriv use karta hai`},{en:`SNMPv3 users must appear in the running-config`,hi:`SNMPv3 users running-config mein dikhne chahiye`},{en:`The engine ID is invalid`,hi:`Engine ID invalid hai`}],a:1,w:{en:`The group uses "security model:v3 priv" and the user has AES128 privacy, so requests must be authenticated and encrypted. An authNoPriv request does not meet the group security level and is rejected. Update the NMS profile to authPriv with AES-128. v3 users never appear in the running-config.`,hi:`Group "security model:v3 priv" use karta hai aur user ke paas AES128 privacy hai, isliye requests authenticated aur encrypted honi chahiye. authNoPriv request group ka security level poora nahi karti aur reject hoti hai. NMS profile ko AES-128 ke saath authPriv par update karo. v3 users running-config mein kabhi nahi dikhte.`}}];export{e as default};