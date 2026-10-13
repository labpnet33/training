var e=[{title:{en:`The SaaS rule that never hits`,hi:`SaaS rule jo kabhi hit nahi hota`},ticket:{en:`BR1-FGT: a new rule "Cloud-Apps" should send video SaaS over ISP2, but users still use ISP1. Policy route output is shown. What is the cause?`,hi:`BR1-FGT: naya rule "Cloud-Apps" video SaaS ko ISP2 par bhejna chahiye, lekin users abhi bhi ISP1 use karte hain. Policy route output dikhaya gaya hai. Cause kya hai?`},out:`! Reference configuration (not run in the simulator)
! Illustrative output, not captured from a device
BR1-FGT # diagnose firewall proute list
list route policy info(vf=root):

id=2130771969(0x7f010001) vwl_service=1(All-Internet) vwl_mbr_seq=1 dscp_tag=0xff 0xff flags=0x0 protocol=0 sport=0-65535 iif=0 dport=1-65535 path(1) oif=3(port1)
source(1): 0.0.0.0-255.255.255.255
destination(1): 0.0.0.0-255.255.255.255
hit_count=88214 last_used=2026-10-02 10:02:11

id=2130771970(0x7f010002) vwl_service=2(Cloud-Apps) vwl_mbr_seq=2 dscp_tag=0xff 0xff flags=0x0 protocol=0 sport=0-65535 iif=0 dport=1-65535 path(1) oif=4(port2)
source(1): 0.0.0.0-255.255.255.255
destination(1): 203.0.113.128-203.0.113.255
hit_count=0 last_used=N/A`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Lower the latency threshold of Cloud-Apps`,hi:`Cloud-Apps ka latency threshold kam karo`},{en:`Add a third member to the zone`,hi:`Zone mein teesra member jodo`},{en:`Move Cloud-Apps above All-Internet`,hi:`Cloud-Apps ko All-Internet ke upar le jao`},{en:`Restart the health check`,hi:`Health check restart karo`}],a:2,w:{en:`Cloud-Apps has zero hits while All-Internet matches every destination and has 88214. Rules are evaluated top to bottom, so the catch-all takes the traffic first. Reordering fixes it; SLA tuning cannot, because no traffic reaches the rule.`,hi:`Cloud-Apps ke zero hits hain jabki All-Internet har destination match karta hai aur uske 88214 hits hain. Rules upar se neeche evaluate hote hain, isliye catch-all pehle traffic le jaata hai. Reorder karne se fix hota hai; SLA tuning se nahi, kyunki rule tak traffic pahunchta hi nahi.`}},{title:{en:`ISP2 overlay dead, ISP2 is fine`,hi:`ISP2 overlay dead, ISP2 theek hai`},ticket:{en:`HUB1-ISP2 is dead for an hour. ISP2 says the line is clean and a ping from 198.51.100.2 to the hub underlay address works. What is the most likely cause?`,hi:`HUB1-ISP2 ek ghante se dead hai. ISP2 kehta hai line saaf hai aur 198.51.100.2 se hub underlay address ka ping chalta hai. Sabse likely cause kya hai?`},out:`! Reference configuration (not run in the simulator)
! Illustrative output, not captured from a device
BR1-FGT # diagnose sys sdwan health-check HUB-HC
Health Check(HUB-HC):
Seq(3 HUB1-ISP1): state(alive), packet-loss(0.000%) latency(11.482), jitter(0.620), sla_map=0x1
Seq(4 HUB1-ISP2): state(dead), packet-loss(100.000%) latency(0.000), jitter(0.000), sla_map=0x0

BR1-FGT # get router info routing-table details 10.200.99.1
Routing entry for 10.200.99.1/32
  Known via "bgp", distance 200, metric 0, best
  * 10.255.1.1, via HUB1-ISP1`,q:{en:`Why is HUB1-ISP2 dead?`,hi:`HUB1-ISP2 dead kyun hai?`},o:[{en:`The probe target 10.200.99.1 is only reachable through HUB1-ISP1, so probes via ISP2 get no answer`,hi:`Probe target 10.200.99.1 sirf HUB1-ISP1 se reachable hai, isliye ISP2 ke probes ko jawab nahi milta`},{en:`ISP2 drops all ICMP`,hi:`ISP2 saara ICMP drop karta hai`},{en:`The SLA latency threshold is too low`,hi:`SLA latency threshold bahut kam hai`},{en:`The zone has too many members`,hi:`Zone mein bahut zyada members hain`}],a:0,w:{en:`The route to the probe target exists only over HUB1-ISP1. Probes sent through HUB1-ISP2 cannot be answered, so 100 percent loss and state dead, while the underlay itself works. Advertise the target over both tunnels or choose a target every member reaches.`,hi:`Probe target ka route sirf HUB1-ISP1 par hai. HUB1-ISP2 se bheje probes ka jawab nahi aa sakta, isliye 100 percent loss aur state dead, jabki underlay khud chalta hai. Target ko dono tunnels par advertise karo ya aisa target chuno jo har member reach kare.`}},{title:{en:`Denied on the overlay member`,hi:`Overlay member par denied`},ticket:{en:`Branch users reach the hub only when the SD-WAN rule picks HUB1-ISP1. When it picks HUB1-ISP2 the traffic fails. Flow trace and policy excerpt are shown. What is wrong?`,hi:`Branch users hub tak tabhi pahunchte hain jab SD-WAN rule HUB1-ISP1 chunta hai. HUB1-ISP2 chunne par traffic fail hota hai. Flow trace aur policy excerpt dikhaye gaye hain. Kya galat hai?`},out:`! Reference configuration (not run in the simulator)
! Illustrative output, not captured from a device
id=20085 trace_id=4 func=__vf_ip_route_input_rcu line=1987 msg="Match policy routing id=2130771969: to 10.0.0.50 via ifindex-21"
id=20085 trace_id=4 func=vf_ip_route_input_common line=2605 msg="find a route: flag=04000000 gw-10.255.2.1 via HUB1-ISP2"
id=20085 trace_id=4 func=fw_forward_handler line=811 msg="Denied by forward policy check (policy 0)"

config firewall policy
    edit 11
        set name "LAN-to-Hub"
        set srcintf "port5"
        set dstintf "HUB1-ISP1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
    next
end`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Disable the health check on HUB1-ISP2`,hi:`HUB1-ISP2 par health check disable karo`},{en:`Change the IKE version of the tunnel`,hi:`Tunnel ka IKE version badlo`},{en:`Add a static route for 10.0.0.50 on port5`,hi:`port5 par 10.0.0.50 ka static route jodo`},{en:`Use the overlay zone as dstintf of the policy`,hi:`Policy ke dstintf mein overlay zone use karo`}],a:3,w:{en:`The rule and the route correctly pick HUB1-ISP2, but the only policy names HUB1-ISP1, so the flow is denied. The destination of the policy must be the overlay zone that contains both tunnels.`,hi:`Rule aur route sahi HUB1-ISP2 chunte hain, lekin ekmatra policy HUB1-ISP1 naam karti hai, isliye flow deny hota hai. Policy ka destination overlay zone hona chahiye jisme dono tunnels hain.`}},{title:{en:`The call that stayed on the failed link`,hi:`Call jo failed link par hi rahi`},ticket:{en:`ISP1 degraded and the service view now prefers ISP2, but one long video call is still bad. The session entry is shown. What explains it?`,hi:`ISP1 degrade hui aur service view ab ISP2 prefer karta hai, lekin ek lambi video call abhi bhi kharab hai. Session entry dikhayi gayi hai. Ise kya explain karta hai?`},out:`! Reference configuration (not run in the simulator)
! Illustrative output, not captured from a device
BR1-FGT # diagnose sys session list
session info: proto=17 proto_state=01 duration=1860 expire=170 timeout=180 flags=00000000 socktype=0
state=may_dirty log
hook=post dir=org act=snat 10.1.1.20:50122->198.51.100.200:3478(203.0.113.2:50122)
misc=0 policy_id=10 vd=0
sdwan_mbr_seq=1 sdwan_service_id=2

BR1-FGT # diagnose sys sdwan service 2
  Members(2):
    1: Seq_num(1 port1), alive, sla(0x0), cfg_order(0), local cost(0)
    2: Seq_num(2 port2), alive, sla(0x1), cfg_order(1), local cost(0), selected`,q:{en:`Why is the call still on ISP1?`,hi:`Call abhi bhi ISP1 par kyun hai?`},o:[{en:`The health check is dead on port2`,hi:`port2 par health check dead hai`},{en:`The session was created before the change and stays on member 1; new sessions use member 2`,hi:`Session change se pehle bana tha aur member 1 par rehta hai; naye sessions member 2 use karte hain`},{en:`The rule uses the wrong source address`,hi:`Rule galat source address use karta hai`},{en:`NAT is disabled on the policy`,hi:`Policy par NAT disabled hai`}],a:1,w:{en:`The session shows sdwan_mbr_seq=1 and source NAT to the ISP1 address. Existing sessions keep their member; the service view already prefers member 2 for new sessions. The call must reconnect, or that one session must be cleared with a narrow filter.`,hi:`Session sdwan_mbr_seq=1 aur ISP1 address par source NAT dikhata hai. Existing sessions apna member rakhte hain; service view naye sessions ke liye member 2 prefer karta hai. Call ko reconnect karna hoga, ya wahi ek session narrow filter se clear karna hoga.`}},{title:{en:`The shortcut that never forms`,hi:`Shortcut jo kabhi nahi banta`},ticket:{en:`BR1-FGT and BR2-FGT always exchange traffic through the hub. The overlay is healthy. IKE gateway excerpts from the hub and BR2-FGT are shown. What is the likely cause?`,hi:`BR1-FGT aur BR2-FGT hamesha hub ke through traffic bhejte hain. Overlay healthy hai. Hub aur BR2-FGT ke IKE gateway excerpts dikhaye gaye hain. Likely cause kya hai?`},out:`! Reference configuration (not run in the simulator)
! Illustrative output, not captured from a device
HUB1-FGT # diagnose vpn ike gateway list name ISP1-DIALUP
name: ISP1-DIALUP
version: 2
network-id: 1

BR2-FGT # diagnose vpn ike gateway list name HUB1-ISP1
name: HUB1-ISP1
version: 2
network-id: 2
IKE SA: created 1/1  established 1/1`,q:{en:`What should you do first?`,hi:`Pehle kya karna chahiye?`},o:[{en:`Replace the pre-shared key on the hub`,hi:`Hub par pre-shared key badlo`},{en:`Raise the DPD interval`,hi:`DPD interval badhao`},{en:`Align network-id on BR2-FGT with the hub and BR1-FGT, then check sender and receiver flags`,hi:`BR2-FGT ka network-id hub aur BR1-FGT ke saath align karo, phir sender aur receiver flags check karo`},{en:`Disable the health check`,hi:`Health check disable karo`}],a:2,w:{en:`The tunnel is established, so keys are fine, but network-id differs between the hub (1) and BR2 (2). The overlay is then not treated as the same network, which breaks shortcut handling. Align it, then verify the sender and receiver settings.`,hi:`Tunnel established hai, isliye keys theek hain, lekin hub (1) aur BR2 (2) ka network-id alag hai. Tab overlay same network nahi maana jaata, jo shortcut handling tod deta hai. Use align karo, phir sender aur receiver settings verify karo.`}},{title:{en:`Handshake never completes`,hi:`Handshake kabhi poora nahi hota`},ticket:{en:`Branch users cannot open the ERP at 10.0.0.50. Sniffers on both ends are summarised. What is the diagnosis?`,hi:`Branch users 10.0.0.50 par ERP nahi khol paate. Dono ends ke sniffers ka summary diya gaya hai. Diagnosis kya hai?`},out:`! Reference configuration (not run in the simulator)
! Illustrative output, not captured from a device
BR1-FGT # diagnose sniffer packet any 'host 10.0.0.50 and port 443' 4 20 l
HUB1-ISP1 out  10.1.1.20.51514 to 10.0.0.50.443: syn
(no reply seen)

HUB1-FGT # diagnose sniffer packet any 'host 10.1.1.20 and port 443' 4 20 l
HUB1-ISP1 in   10.1.1.20.51514 to 10.0.0.50.443: syn
port3     out  10.0.0.50.443 to 10.1.1.20.51514: syn, ack
HUB1-ISP2 out  10.0.0.50.443 to 10.1.1.20.51514: syn, ack`,q:{en:`What is going on?`,hi:`Kya ho raha hai?`},o:[{en:`Asymmetric routing: the SYN goes over ISP1 but the hub returns the reply over ISP2`,hi:`Asymmetric routing: SYN ISP1 se jaata hai lekin hub reply ISP2 se bhejta hai`},{en:`The server at 10.0.0.50 is down`,hi:`10.0.0.50 ka server down hai`},{en:`The branch has no default route`,hi:`Branch ke paas default route nahi hai`},{en:`The SLA for HUB1-ISP1 is too strict`,hi:`HUB1-ISP1 ka SLA bahut strict hai`}],a:0,w:{en:`The server answers (SYN-ACK seen at port3), but the hub sends it out HUB1-ISP2, not the tunnel the SYN arrived on. The branch drops a reply on an interface that does not match its session. Fix the hub routing preference so the return path matches the branch's choice.`,hi:`Server jawab deta hai (port3 par SYN-ACK dikha), lekin hub use us tunnel se nahi balki HUB1-ISP2 se bhejta hai jis par SYN aaya tha. Branch aisi interface par aaye reply ko drop karta hai jo uske session se match nahi karti. Hub routing preference theek karo taaki return path branch ke choice se match kare.`}},{title:{en:`Health check without a server`,hi:`Bina server wala health check`},ticket:{en:`After a FortiManager install, BR5-FGT shows every member dead. The Install Preview excerpt for BR5-FGT is shown. What is the cause?`,hi:`FortiManager install ke baad BR5-FGT har member dead dikhata hai. BR5-FGT ka Install Preview excerpt dikhaya gaya hai. Cause kya hai?`},out:`! Reference configuration (not run in the simulator)
config system sdwan
    config health-check
        edit "HUB-HC"
            set server ""
            set protocol ping
            set members 3 4
        next
    end
end`,q:{en:`Where is the fault most likely?`,hi:`Fault sabse likely kahan hai?`},o:[{en:`A broken ISP cable`,hi:`Toota hua ISP cable`},{en:`The IPsec proposal`,hi:`IPsec proposal`},{en:`The firewall policy order`,hi:`Firewall policy order`},{en:`A metadata variable for the probe address has no value for BR5-FGT`,hi:`Probe address ka metadata variable BR5-FGT ke liye value nahi rakhta`}],a:3,w:{en:`An empty server field in the preview means the variable used by the template is blank for this device. Entering the value and installing again gives a correct health check. This is a delivery problem, not a network problem.`,hi:`Preview mein khaali server field ka matlab template ka variable is device ke liye blank hai. Value bharkar dobara install karne se sahi health check milta hai. Yeh delivery problem hai, network problem nahi.`}}];export{e as default};