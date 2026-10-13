var e=[{title:{en:`Both firewalls say primary`,hi:`Dono firewalls khud ko primary bata rahe hain`},ticket:{en:`Ticket NT-4520: After tonight's maintenance both FGT-A and FGT-B answer on the LAN and users see random resets. Each console shows the unit as the primary. FGT-A prints the following; on FGT-B someone re-typed the heartbeat settings. What is the cause?`,hi:`Ticket NT-4520: Aaj raat ki maintenance ke baad FGT-A aur FGT-B dono LAN par jawab de rahe hain aur users ko random resets dikh rahe hain. Har console unit ko primary dikhata hai. FGT-A yeh print karta hai; FGT-B par kisi ne heartbeat settings dobara type ki thi. Cause kya hai?`},out:`FGT-A # get system ha status
HA Health Status: WARNING: only one member is present, the heartbeat finds no peer
Model: FortiGate-VM64
Mode: HA A-P
Group Name: NILGIRI-HA
Group ID: 20
Primary selected using:
    <2026/10/04 22:40:02> vcluster-1: FGVMEV1NU41WS000 is selected as the primary because it is the only member in the cluster.
Primary     : FGT-A           , FGVMEV1NU41WS000, HA cluster index = 0
number of vcluster: 1

FGT-B # show system ha
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set password ENC ...
    set hbdev "port5" 100 "port6" 50
    set priority 100
end`,q:{en:`What is the cause, and what is the risk?`,hi:`Cause kya hai, aur risk kya hai?`},o:[{en:`The priority on FGT-B is too low, so FGT-B does not accept the primary role`,hi:`FGT-B ki priority bahut kam hai, isliye FGT-B primary role accept nahi karta`},{en:`sync-config is disabled, so the units are out-of-sync but still one cluster`,hi:`sync-config disabled hai, isliye units out-of-sync hain par ab bhi ek cluster hain`},{en:`FGT-B uses hbdev port5 and port6, which are not cabled to FGT-A; the heartbeat finds no peer and both units become primary (split brain), so two devices answer on the same virtual MAC and IP`,hi:`FGT-B hbdev port5 aur port6 use karta hai, jo FGT-A se cabled nahi hain; heartbeat ko peer nahi milta aur dono units primary ban jaate hain (split brain), to do devices same virtual MAC aur IP par jawab dete hain`},{en:`The session-pickup setting differs, which makes FGT-B refuse the cluster`,hi:`session-pickup setting alag hai, jisse FGT-B cluster refuse karta hai`}],a:2,w:{en:`The WARNING health line and "it is the only member in the cluster" mean the heartbeat sees no peer. FGT-A has hbdev port3/port4 (cabled back to back); FGT-B was typed with port5/port6. Without a heartbeat path both units elect themselves: split brain. Fix hbdev on FGT-B, check the cabling, and expect one unit to rejoin as secondary and be overwritten by the primary's configuration. Priority and sync-config do not stop units from forming a cluster.`,hi:`WARNING health line aur "it is the only member in the cluster" ka matlab hai ki heartbeat ko peer nahi dikhta. FGT-A mein hbdev port3/port4 hai (back to back cabled); FGT-B par port5/port6 type hua. Heartbeat path ke bina dono units khud ko elect kar lete hain: split brain. FGT-B par hbdev theek karo, cabling check karo, aur dhyan rakho ki ek unit secondary ki tarah rejoin karke primary ki configuration se overwrite hoga. Priority aur sync-config units ko cluster banne se nahi rokte.`}},{title:{en:`Internet down 25 minutes, no failover`,hi:`Internet 25 minute down, failover nahi hua`},ticket:{en:`Ticket NT-4471: Last night the ISP uplink behind FGT-A's WAN switch failed. Users had no internet for 25 minutes although FGT-B was healthy. FGT-A is the primary. Why did the cluster not fail over?`,hi:`Ticket NT-4471: Kal raat FGT-A ke WAN switch ke peeche ISP uplink fail ho gaya. FGT-B healthy hone ke bawajood users ke paas 25 minute internet nahi tha. FGT-A primary hai. Cluster ne fail over kyun nahi kiya?`},out:`FGT-A # get system ha status
HA Health Status: OK
Mode: HA A-P
Group Name: NILGIRI-HA
Group ID: 20
Primary selected using:
    <2026/10/03 09:12:40> vcluster-1: FGVMEV1NU41WS000 is selected as the primary because its priority is larger than peer member FGVMEV1OO2UZP000.
MONDEV stats:
    FGVMEV1NU41WS000(updated 1 seconds ago):
        port1: physical/1000auto, up, rx-bytes/packets/dropped/errors=804/6/0/0, tx=804/6/0/0
        port2: physical/1000auto, up, rx-bytes/packets/dropped/errors=2210/31/0/0, tx=1990/28/0/0

FGT-A # show system interface port1
    edit "port1"
        set vdom "root"
        set ip 198.51.100.2 255.255.255.248
        set allowaccess ping
        set type physical
        set alias "WAN"
        set role wan

FGT-A # execute ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
--- 8.8.8.8 ping statistics ---
5 packets transmitted, 0 packets received, 100% packet loss`,q:{en:`What is the correct explanation and fix?`,hi:`Sahi explanation aur fix kya hai?`},o:[{en:`port1 stayed up (the break was behind the switch), and no remote link monitoring exists; add gwdetect with detectserver 198.51.100.1 and ha-priority, plus pingserver-monitor-interface and a failover threshold`,hi:`port1 up raha (toot switch ke peeche tha), aur remote link monitoring hai hi nahi; gwdetect with detectserver 198.51.100.1 aur ha-priority jodo, saath mein pingserver-monitor-interface aur failover threshold`},{en:`FGT-A's priority is too high; lowering it to 50 will make the cluster fail over`,hi:`FGT-A ki priority bahut high hai; use 50 karne se cluster fail over karega`},{en:`session-pickup is disabled, so the secondary refuses to take over`,hi:`session-pickup disabled hai, isliye secondary take over se mana karta hai`},{en:`hb-lost-threshold is too high, so the heartbeat takes 25 minutes to time out`,hi:`hb-lost-threshold bahut high hai, isliye heartbeat ko time out hone mein 25 minute lagte hain`}],a:0,w:{en:`Port monitoring only sees the local link. The cable from FGT-A still reaches SW-WAN-A, so port1 is up, MONDEV shows no failure and no election criterion changes. A failure behind the switch is invisible without remote link monitoring (gwdetect, detectserver, ha-priority on the interface, and the pingserver settings in HA). Priority does not trigger failover, session-pickup only affects sessions and the heartbeat is healthy.`,hi:`Port monitoring sirf local link dekhta hai. FGT-A ki cable ab bhi SW-WAN-A tak pahunchti hai, isliye port1 up hai, MONDEV mein failure nahi aur koi election criterion nahi badalta. Switch ke peeche ki failure remote link monitoring (interface par gwdetect, detectserver, ha-priority, aur HA mein pingserver settings) ke bina dikhti hi nahi. Priority failover trigger nahi karti, session-pickup sirf sessions par asar karta hai aur heartbeat healthy hai.`}},{title:{en:`The repaired unit does not take the role back`,hi:`Repair hua unit role wapas nahi leta`},ticket:{en:`Ticket NT-4488: The uplink of FGT-A was repaired at 21:30 and works, yet FGT-B is still primary and FGT-A (priority 200) is secondary. The customer wants to know whether the cluster is broken. Override is disabled on both units.`,hi:`Ticket NT-4488: FGT-A ka uplink 21:30 par repair ho gaya aur kaam kar raha hai, phir bhi FGT-B abhi primary hai aur FGT-A (priority 200) secondary. Customer jaanna chahta hai ki cluster kharab to nahi. Dono units par override disabled hai.`},out:`FGT-A # diagnose sys ha history read
<2026/10/04 21:13:31> vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because the value of link-failure + pingsvr-failure is less than peer member FGVMEV1NU41WS000.
<2026/10/04 21:13:31> remote link monitoring failed, HA uptime of FGVMEV1NU41WS000 is reset
<2026/10/04 21:13:31> ping server 198.51.100.1 of port1 is not reachable
<2026/10/04 21:13:00> vcluster-1: FGVMEV1NU41WS000 is selected as the primary because its priority is larger than peer member FGVMEV1OO2UZP000.

FGT-A # get system ha status
HA Health Status: OK
override: disable
Primary     : FGT-B           , FGVMEV1OO2UZP000, HA cluster index = 0
Secondary   : FGT-A           , FGVMEV1NU41WS000, HA cluster index = 1`,q:{en:`Why is FGT-B still primary, and how do you hand the role back in a controlled way?`,hi:`FGT-B abhi bhi primary kyun hai, aur role ko controlled tareeke se kaise wapas dein?`},o:[{en:`The cluster is broken; remove FGT-A from the cluster and join it again`,hi:`Cluster toot gaya hai; FGT-A ko cluster se hatao aur dobara join karao`},{en:`sync-config is disabled; enable it and FGT-A becomes primary at once`,hi:`sync-config disabled hai; use enable karo to FGT-A turant primary ban jaata hai`},{en:`FGT-B has the higher serial number, and the serial always decides first`,hi:`FGT-B ka serial number bada hai, aur serial hamesha pehle decide karta hai`},{en:`The failure reset FGT-A's HA age, so FGT-B is older and wins on age before priority is compared; use execute ha failover set 1 on FGT-B (or enable override on both units, ideally with override-wait-time)`,hi:`Failure ne FGT-A ki HA age reset ki, isliye FGT-B purana hai aur priority compare hone se pehle age par jeetta hai; FGT-B par execute ha failover set 1 use karo (ya dono units par override enable karo, behtar hai override-wait-time ke saath)`}],a:3,w:{en:`Without override the order is failures, then age (difference above the 300 s margin), then priority, then serial. The history shows the remote link monitoring failure reset FGT-A's uptime, so FGT-B is now older. This is the designed no-preempt behaviour that avoids a second outage. A controlled failback is a planned failover set 1 on FGT-B, or override on both units. Sync and the serial number are not the reason.`,hi:`Override ke bina order hai: failures, phir age (difference 300 s margin se bada), phir priority, phir serial. History dikhati hai ki remote link monitoring failure ne FGT-A ki uptime reset ki, isliye FGT-B ab purana hai. Yeh designed no-preempt behaviour hai jo doosre outage se bachata hai. Controlled failback FGT-B par planned failover set 1 hai, ya dono units par override. Sync aur serial number wajah nahi hain.`}},{title:{en:`VoIP policy only exists on FGT-A`,hi:`VoIP policy sirf FGT-A par hai`},ticket:{en:`Ticket NT-4502: After last week's change window the VoIP policy exists on FGT-A only, and get system ha status shows the secondary as out-of-sync. If FGT-A dies tonight, VoIP breaks. Someone also left a TEMP-TEST policy on FGT-B. What do you do, and what happens to the TEMP-TEST policy?`,hi:`Ticket NT-4502: Pichhle hafte ki change window ke baad VoIP policy sirf FGT-A par hai, aur get system ha status secondary ko out-of-sync dikhata hai. Agar aaj raat FGT-A mar gaya to VoIP toot jayega. Kisi ne FGT-B par TEMP-TEST policy bhi chhodi hai. Aap kya karoge, aur TEMP-TEST policy ka kya hoga?`},out:`FGT-A # get system ha status
Configuration Status:
    FGVMEV1OO2UZP000(updated 3 seconds ago): out-of-sync
    FGVMEV1NU41WS000(updated 2 seconds ago): out-of-sync

FGT-A # show system ha
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set sync-config disable
    set hbdev "port3" 100 "port4" 50
    set priority 200
end

FGT-A # diagnose sys ha checksum show
firewall.address: a9 3f 30 4d d2 37 12 7a 5c a8 05 86 02 e1 3a 18
firewall.policy: 0a 18 eb 8d 87 c8 f0 dd 39 a5 e8 4b 9b c4 f2 ea
system.global: 5b 3b 6e 2c 36 b4 9c ed af b3 df f8 4f 34 db 51

FGT-B # diagnose sys ha checksum show
firewall.address: a9 3f 30 4d d2 37 12 7a 5c a8 05 86 02 e1 3a 18
firewall.policy: 77 c2 19 e0 4d 5a b1 08 f3 66 a0 2e 91 d7 3c 5b
system.global: 5b 3b 6e 2c 36 b4 9c ed af b3 df f8 4f 34 db 51`,q:{en:`What is the correct action and result?`,hi:`Sahi action aur result kya hai?`},o:[{en:`Edit FGT-B to add the VoIP policy by hand; the primary then accepts it`,hi:`FGT-B par VoIP policy haath se jodo; primary use phir accept kar leta hai`},{en:`Record policy 99 first, then run set sync-config enable on the primary; FGT-B receives policy 2 and loses policy 99 because the primary always wins`,hi:`Pehle policy 99 record karo, phir primary par set sync-config enable chalao; FGT-B ko policy 2 milti hai aur policy 99 chali jaati hai kyunki primary hamesha jeetta hai`},{en:`Run diagnose sys ha reset-uptime on FGT-B so that it becomes primary and pushes policy 99 to FGT-A`,hi:`FGT-B par diagnose sys ha reset-uptime chalao taaki woh primary bane aur policy 99 FGT-A ko push kare`},{en:`Change the host name of FGT-B; the checksum mismatch is caused by the names`,hi:`FGT-B ka host name badlo; checksum mismatch naam ki wajah se hai`}],a:1,w:{en:`Only firewall.policy differs, and show system ha reveals sync-config disable as the root cause. Enabling it on the primary pushes the whole configuration: policy 2 arrives on FGT-B and policy 99 disappears. Record local changes first. A manual edit on a secondary is sent to the primary and does not fix the cause; reset-uptime changes roles, not synchronisation; host names are excluded from the checksum.`,hi:`Sirf firewall.policy alag hai, aur show system ha mein sync-config disable root cause dikhta hai. Primary par enable karne se poori configuration push hoti hai: FGT-B par policy 2 aati hai aur policy 99 gayab ho jaati hai. Local changes pehle record karo. Secondary par manual edit primary ko bheja jaata hai aur cause theek nahi karta; reset-uptime roles badalta hai, synchronisation nahi; host names checksum se bahar hain.`}},{title:{en:`Web survived the failover, phone calls did not`,hi:`Failover mein web bacha, phone calls nahi`},ticket:{en:`Ticket NT-4533: After a planned failover the SSH sessions of the admins continued, but DNS lookups hung and all IP phone calls dropped. Session pickup is "on". The listing below was taken on the secondary FGT-B before the failover, while PC-LAN ran curl, a DNS query and a ping. What is missing?`,hi:`Ticket NT-4533: Planned failover ke baad admins ke SSH sessions chalte rahe, par DNS lookups atak gaye aur saari IP phone calls gir gayi. Session pickup "on" hai. Neeche ki listing failover se pehle secondary FGT-B par li gayi thi, jab PC-LAN curl, DNS query aur ping chala raha tha. Kya missing hai?`},out:`FGT-B # diagnose sys session list
session info: proto=6 proto_state=01 duration=34 expire=3566 timeout=3600 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
state=may_dirty synced
hook=post dir=org act=snat 10.10.1.10:64251->8.8.8.8:80(198.51.100.2:60002)
total session 1

FGT-B # show system ha
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set session-pickup enable
    set hbdev "port3" 100 "port4" 50
    set priority 100
end`,q:{en:`Which setting closes the gap?`,hi:`Kaunsi setting gap band karti hai?`},o:[{en:`session-pickup-delay enable`,hi:`session-pickup-delay enable`},{en:`set override enable on both units`,hi:`dono units par set override enable`},{en:`session-pickup-connectionless enable, because only TCP is copied by plain session-pickup`,hi:`session-pickup-connectionless enable, kyunki plain session-pickup sirf TCP copy karta hai`},{en:`set sync-config enable`,hi:`set sync-config enable`}],a:2,w:{en:`The secondary holds one session with proto=6 (TCP, synced) and no UDP (DNS) or ICMP entry, so the connectionless sessions exist only on the primary and vanish at failover. Add session-pickup-connectionless on the primary; it synchronises to the other unit. session-pickup-delay would copy even fewer sessions, override moves roles, and sync-config is about configuration.`,hi:`Secondary ke paas proto=6 (TCP, synced) ka ek session hai aur koi UDP (DNS) ya ICMP entry nahi, isliye connectionless sessions sirf primary par hain aur failover par gayab ho jaate hain. Primary par session-pickup-connectionless jodo; woh doosre unit tak synchronise hota hai. session-pickup-delay aur kam sessions copy karta, override roles move karta hai, aur sync-config configuration ke baare mein hai.`}},{title:{en:`Unexpected failback after a reboot`,hi:`Reboot ke baad achanak failback`},ticket:{en:`Ticket NT-4547: FGT-B had been primary for two weeks. After a power test FGT-A rebooted and a few minutes later took the primary role back, which interrupted users for a moment. Nobody changed any HA setting. Why did it happen?`,hi:`Ticket NT-4547: FGT-B do hafte se primary tha. Power test ke baad FGT-A reboot hua aur kuch minute baad primary role wapas le liya, jisse users ko kuch der interruption hui. Kisi ne koi HA setting nahi badli. Aisa kyun hua?`},out:`FGT-A # show system ha
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set hbdev "port3" 100 "port4" 50
    set override enable
    set priority 200
end

FGT-B # show system ha
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set hbdev "port3" 100 "port4" 50
    set priority 100
end

FGT-A # diagnose sys ha history read
<2026/10/04 22:05:12> vcluster-1: FGVMEV1NU41WS000 is selected as the primary because its override priority is larger than peer member FGVMEV1OO2UZP000.`,q:{en:`What is the explanation?`,hi:`Explanation kya hai?`},o:[{en:`Override was enabled on FGT-A only (it is not synchronised), so priority 200 is compared before age and FGT-A preempted when it rejoined; set override the same on both units and add override-wait-time`,hi:`Override sirf FGT-A par enabled tha (yeh synchronise nahi hota), isliye priority 200 age se pehle compare hui aur FGT-A ne rejoin par preempt kiya; override dono units par same set karo aur override-wait-time jodo`},{en:`The 300 s uptime margin expired and FGT-B was demoted by age`,hi:`300 s uptime margin khatam hua aur FGT-B age ke karan demote hua`},{en:`The heartbeat was lost during the power test, which caused split brain and a random winner`,hi:`Power test mein heartbeat lost hua, jisse split brain hua aur random winner nikla`},{en:`Config sync copied priority 200 from FGT-A to FGT-B`,hi:`Config sync ne priority 200 FGT-A se FGT-B ko copy kar di`}],a:0,w:{en:`The history text "its override priority is larger than peer member" is the signature of override. Only FGT-A has set override enable, and override, priority and override-wait-time are never synchronised. With priority ahead of age, FGT-A (200) beats FGT-B (100) as soon as it is healthy. Hold the setting identical on both units and use override-wait-time so a rebooted unit waits until it is ready.`,hi:`History text "its override priority is larger than peer member" override ki pehchaan hai. Sirf FGT-A par override enable set hai, aur override, priority aur override-wait-time kabhi synchronise nahi hote. Priority age se aage hone par FGT-A (200) healthy hote hi FGT-B (100) ko haraata hai. Setting dono units par identical rakho aur override-wait-time use karo taaki reboot hua unit ready hone tak wait kare.`}},{title:{en:`Cannot SNMP-poll or SSH to FGT-B`,hi:`FGT-B ko SNMP poll ya SSH nahi ho pata`},ticket:{en:`Ticket NT-4560: PC-NOC (10.99.0.10) reaches FGT-A at 10.99.0.11 but never FGT-B at 10.99.0.12, so monitoring shows the secondary as down. FGT-B works as a standby. The NOC needs to manage each unit directly. What is missing?`,hi:`Ticket NT-4560: PC-NOC (10.99.0.10) FGT-A ko 10.99.0.11 par pahunchta hai par FGT-B ko 10.99.0.12 par kabhi nahi, isliye monitoring secondary ko down dikhati hai. FGT-B standby ki tarah kaam karta hai. NOC ko har unit direct manage karni hai. Kya missing hai?`},out:`FGT-A # show system ha
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set hbdev "port3" 100 "port4" 50
    set priority 200
end

FGT-A # show system interface port8
    edit "port8"
        set vdom "root"
        set ip 10.99.0.11 255.255.255.0
        set allowaccess ping ssh snmp
        set alias "MGMT"

PC-NOC # ping 10.99.0.12
Request timeout for icmp_seq 1
Request timeout for icmp_seq 2
--- 10.99.0.12 ping statistics ---
2 packets transmitted, 0 packets received, 100% packet loss`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Give port8 of both units the same IP 10.99.0.11 so that either unit answers`,hi:`Dono units ke port8 ko same IP 10.99.0.11 do taaki koi bhi unit jawab de`},{en:`Raise the priority of FGT-B so that it becomes primary and answers on port8`,hi:`FGT-B ki priority badhao taaki woh primary bane aur port8 par jawab de`},{en:`Add port8 to the hbdev list so the heartbeat carries management traffic`,hi:`port8 ko hbdev list mein jodo taaki heartbeat management traffic le jaye`},{en:`Enable ha-mgmt-status and define the reserved management interface (config ha-mgmt-interfaces, edit 1, interface port8, gateway 10.99.0.1), then set a different IP on port8 of each unit (10.99.0.11 and 10.99.0.12)`,hi:`ha-mgmt-status enable karo aur reserved management interface define karo (config ha-mgmt-interfaces, edit 1, interface port8, gateway 10.99.0.1), phir har unit ke port8 par alag IP set karo (10.99.0.11 aur 10.99.0.12)`}],a:3,w:{en:`The HA block has no ha-mgmt-status, so on the secondary every data interface, including port8, holds no address. A reserved management interface keeps its own IP and a route through the gateway on every unit, also on the secondary. The interface entry is per unit, so each unit gets a different address. The same IP on both units would create an address conflict, priority does not help the standby, and a management interface cannot be a heartbeat device.`,hi:`HA block mein ha-mgmt-status nahi hai, isliye secondary par har data interface, port8 samet, bina address ke hota hai. Reserved management interface har unit par, secondary par bhi, apna IP aur gateway ke through route rakhta hai. Interface entry per unit hai, isliye har unit ko alag address milta hai. Dono par same IP address conflict banata, priority standby ki madad nahi karti, aur management interface heartbeat device nahi ho sakta.`}},{title:{en:`Primary role flips back and forth`,hi:`Primary role idhar-udhar flip hota hai`},ticket:{en:`Ticket NT-4575: The shared ISP router 198.51.100.1 had a 10 minute outage. Both units monitor it with remote link monitoring. The cluster failed over once and then stopped flapping, although both units kept failing the ping server. Which setting limited the flapping?`,hi:`Ticket NT-4575: Shared ISP router 198.51.100.1 ka 10 minute outage hua. Dono units use remote link monitoring se monitor karte hain. Cluster ek baar fail over hua aur phir flap karna band kar diya, jabki dono units ping server fail karte rahe. Kaunsi setting ne flapping limit ki?`},out:`FGT-A # diagnose sys ha history read
<2026/10/04 23:41:55> ping server 198.51.100.1 of port1 is not reachable
<2026/10/04 23:41:12> vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because the value of link-failure + pingsvr-failure is less than peer member FGVMEV1NU41WS000.
<2026/10/04 23:41:12> remote link monitoring failed, HA uptime of FGVMEV1NU41WS000 is reset
<2026/10/04 23:41:11> ping server 198.51.100.1 of port1 is not reachable

FGT-A # show system ha
config system ha
    set group-id 20
    set group-name "NILGIRI-HA"
    set mode a-p
    set hbdev "port3" 100 "port4" 50
    set priority 200
    set monitor "port1" "port2"
    set pingserver-monitor-interface "port1"
    set pingserver-failover-threshold 5
    set pingserver-flip-timeout 6
end`,q:{en:`Which setting stopped the flip-flop, and what is the real fix?`,hi:`Kaunsi setting ne flip-flop roka, aur asli fix kya hai?`},o:[{en:`ha-uptime-diff-margin, and the fix is to raise it to 3600 seconds`,hi:`ha-uptime-diff-margin, aur fix use 3600 seconds karna hai`},{en:`pingserver-flip-timeout (minutes): after a ping-server failover the new primary ignores its own ping failures for that time; the real fix is the shared upstream outage, or a ping server that does not sit behind a common single point`,hi:`pingserver-flip-timeout (minutes): ping-server failover ke baad naya primary us time tak apni ping failures ignore karta hai; asli fix shared upstream outage hai, ya aisa ping server jo common single point ke peeche na ho`},{en:`pingserver-failover-threshold, because a higher value makes both units never fail`,hi:`pingserver-failover-threshold, kyunki higher value se dono units kabhi fail nahi hote`},{en:`session-pickup-delay, because it holds sessions back from the new primary`,hi:`session-pickup-delay, kyunki woh sessions ko naye primary se rok leta hai`}],a:1,w:{en:`Both units fail the same server, so every election could pick the other unit and the role could ping-pong. pingserver-flip-timeout (6 minutes here, default 60) makes the new primary ignore its own ping-server failures for that time, which stops the flapping. It only treats the symptom: the root cause is a shared upstream dependency, so choose a ping server whose failure really means one unit has lost its path.`,hi:`Dono units wahi server fail karte hain, isliye har election doosre unit ko chun sakta hai aur role ping-pong kar sakta hai. pingserver-flip-timeout (yahan 6 minute, default 60) naye primary ko us time tak apni ping-server failures ignore karwata hai, jisse flapping rukti hai. Yeh sirf symptom theek karta hai: root cause shared upstream dependency hai, isliye aisa ping server chuno jiski failure ka matlab sach mein ek unit ka path gaya ho.`}}];export{e as default};