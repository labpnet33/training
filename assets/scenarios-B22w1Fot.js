var e=[{title:{en:`Nothing leaves the Pune LAN`,hi:`Pune LAN se kuch bahar nahi nikalta`},ticket:{en:`A new Pune branch FortiGate has addresses and a default route, but users cannot ping or browse the internet. The engineer runs a ping from PC1 and a policy lookup. Read the output. What is the cause?`,hi:`Naye Pune branch FortiGate mein addresses aur default route hain, lekin users internet ping ya browse nahi kar paate. Engineer PC1 se ping aur policy lookup chalata hai. Output padho. Cause kya hai?`},out:`PC1> ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
8.8.8.8 icmp_seq=2 timeout
8.8.8.8 icmp_seq=3 timeout

FGT1 # diagnose firewall iprope lookup 10.0.1.10 1 8.8.8.8 0 icmp port2
src [10.0.1.10-1] dst [8.8.8.8-0] proto icmp dev port2 matches policy id: 0`,q:{en:`What does "policy id: 0" tell you here?`,hi:`Yahan "policy id: 0" kya batata hai?`},o:[{en:`No policy matches, so the implicit deny drops the traffic`,hi:`Koi policy match nahi karti, isliye implicit deny traffic drop karta hai`},{en:`The ISP link is down`,hi:`ISP link down hai`},{en:`The default route is missing`,hi:`Default route missing hai`},{en:`NAT has run out of ports`,hi:`NAT ke ports khatam ho gaye`}],a:0,w:{en:`Policy 0 is the implicit deny. A lookup that returns 0 means no policy matched the described packet. Build an accept policy for LAN to WAN.`,hi:`Policy 0 implicit deny hai. Lookup 0 de to matlab describe kiye packet se koi policy match nahi hui. LAN se WAN ke liye accept policy banao.`}},{title:{en:`HR blocked one site and everything else went down`,hi:`HR ne ek site block ki aur baaki sab band ho gaya`},ticket:{en:`After the change "block the social site", no user reaches anything. Read the policy list and the hit counters. What is the root cause?`,hi:`Change "social site block karo" ke baad koi kuch reach nahi kar pa raha. Policy list aur hit counters padho. Root cause kya hai?`},out:`FGT1 # show firewall policy
config firewall policy
    edit 1
        set name "BLOCK-SOCIAL"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
    edit 2
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end

FGT1 # diagnose firewall iprope show 100004 1
idx=1 pkts/bytes=0/0 flag=0x0 hit count:10
FGT1 # diagnose firewall iprope show 100004 2
idx=2 pkts/bytes=0/0 flag=0x0 hit count:0`,q:{en:`Why does policy 2 never get a hit?`,hi:`Policy 2 ko kabhi hit kyun nahi milta?`},o:[{en:`Policy 2 is missing NAT`,hi:`Policy 2 mein NAT missing hai`},{en:`Policy 2 has the wrong service`,hi:`Policy 2 ki service galat hai`},{en:`Policy 1 has the default action deny and matches all sources, destinations and services, so it shadows policy 2`,hi:`Policy 1 ka default action deny hai aur woh saare sources, destinations aur services match karti hai, isliye policy 2 ko shadow karti hai`},{en:`Policy IDs must increase with every policy`,hi:`Policy IDs har policy ke saath badhni chahiye`}],a:2,w:{en:`Policy 1 has no action line, so it uses the default deny, and "all/all/ALL" matches everything. It is above policy 2 in the list. Narrow its destination to the social site object.`,hi:`Policy 1 mein action line nahi hai, isliye default deny lagta hai, aur "all/all/ALL" sab match karta hai. Yeh list mein policy 2 ke upar hai. Uski destination ko social site object tak narrow karo.`}},{title:{en:`The marketing exception does not work`,hi:`Marketing ka exception kaam nahi karta`},ticket:{en:`The engineer added policy 3 so that PC 10.0.1.20 may use HTTPS to the social site, but the PC is still blocked. Read the output. What is the correct fix?`,hi:`Engineer ne policy 3 add ki taaki PC 10.0.1.20 social site par HTTPS use kare, lekin PC abhi bhi blocked hai. Output padho. Sahi fix kya hai?`},out:`FGT1 # get firewall policy
== [ 1 ]
policyid: 1   name: BLOCK-SOCIAL
== [ 2 ]
policyid: 2   name: LAN-to-WAN
== [ 3 ]
policyid: 3   name: MKT-SOCIAL

FGT1 # diagnose firewall iprope lookup 10.0.1.20 50000 198.51.100.10 443 tcp port2
src [10.0.1.20-50000] dst [198.51.100.10-443] proto tcp dev port2 matches policy id: 1

FGT1 # diagnose firewall iprope show 100004 3
idx=3 pkts/bytes=0/0 flag=0x0 hit count:0`,q:{en:`What should the engineer do?`,hi:`Engineer ko kya karna chahiye?`},o:[{en:`Change policy 3 to service ALL`,hi:`Policy 3 ko service ALL kar do`},{en:`Move policy 3 above policy 1 (move 3 before 1)`,hi:`Policy 3 ko policy 1 ke upar move karo (move 3 before 1)`},{en:`Delete policy 2`,hi:`Policy 2 delete karo`},{en:`Enable NAT on policy 1`,hi:`Policy 1 par NAT enable karo`}],a:1,w:{en:`The lookup shows policy 1 wins for the PC. Policies are evaluated in list order, and policy 3 sits below the block. Moving it above policy 1 lets the exception match first.`,hi:`Lookup dikhata hai ki PC ke liye policy 1 jeet rahi hai. Policies list order mein evaluate hoti hain, aur policy 3 block ke neeche hai. Use policy 1 ke upar move karne se exception pehle match hota hai.`}},{title:{en:`Same policy, two answers`,hi:`Ek policy, do jawab`},ticket:{en:`A junior ran two lookups for the same web flow and got different answers and thinks the policy is flaky. The policy LAN-to-WAN is srcintf port2, dstintf port1, LAN_NET to all, services HTTP HTTPS DNS PING. What explains the difference?`,hi:`Junior ne ek hi web flow ke liye do lookups chalaye, alag jawab mile aur use lagta hai policy flaky hai. Policy LAN-to-WAN: srcintf port2, dstintf port1, LAN_NET se all, services HTTP HTTPS DNS PING. Difference kya explain karta hai?`},out:`FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 80 tcp port2
src [10.0.1.10-50000] dst [8.8.8.8-80] proto tcp dev port2 matches policy id: 1

FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 80 tcp port1
src [10.0.1.10-50000] dst [8.8.8.8-80] proto tcp dev port1 matches policy id: 0`,q:{en:`Why does the second lookup return 0?`,hi:`Doosra lookup 0 kyun deta hai?`},o:[{en:`The policy randomly fails half of the time`,hi:`Policy aadhi baar random fail hoti hai`},{en:`The route to 8.8.8.8 is missing`,hi:`8.8.8.8 ka route missing hai`},{en:`The service group does not include TCP 80`,hi:`Service group mein TCP 80 nahi hai`},{en:`The second lookup used port1 as the ingress interface, but the policy srcintf is port2`,hi:`Doosre lookup mein ingress interface port1 diya gaya, jabki policy ka srcintf port2 hai`}],a:3,w:{en:`The last argument of the lookup is the ingress interface. The policy only matches traffic entering port2, so a lookup that says the packet enters port1 falls to the implicit deny.`,hi:`Lookup ka aakhri argument ingress interface hai. Policy sirf port2 par enter hone wale traffic ko match karti hai, isliye jis lookup mein packet port1 par enter hota hai woh implicit deny par girta hai.`}},{title:{en:`SSH attempt shows up as policy 0`,hi:`SSH attempt policy 0 ke roop mein dikhta hai`},ticket:{en:`The security team asks why the traffic log has a deny entry with policyid=0 for TCP 22 from 10.0.1.10 to 8.8.8.8, when no policy is called "deny SSH". Read the log lines.`,hi:`Security team poochhti hai ki traffic log mein 10.0.1.10 se 8.8.8.8 ke TCP 22 ke liye policyid=0 wali deny entry kyun hai, jabki "deny SSH" naam ki koi policy nahi. Log lines padho.`},out:`FGT1 # execute log display
2 logs found.
2 logs returned.

1: date=2026-10-02 time=04:03:12 type="traffic" subtype="forward" srcip=10.0.1.10 srcport=57160 srcintf="port2" dstip=8.8.8.8 dstport=22 dstintf="port1" proto=6 action="deny" policyid=0 policytype="policy" service="tcp/22"

2: date=2026-10-02 time=04:03:12 type="traffic" subtype="forward" srcip=10.0.1.10 srcport=64251 srcintf="port2" dstip=8.8.8.8 dstport=80 dstintf="port1" proto=6 action="accept" policyid=1 policyname="LAN-to-WAN" service="HTTP" trandisp="snat" transip=203.0.113.2`,q:{en:`What is the correct explanation?`,hi:`Sahi explanation kaunsi hai?`},o:[{en:`Policy 0 is a hidden security policy you can edit`,hi:`Policy 0 hidden security policy hai jise aap edit kar sakte ho`},{en:`SSH is not allowed by any policy, so the implicit deny (policy 0) dropped it and it is logged because implicit logging is enabled`,hi:`SSH kisi policy se allowed nahi hai, isliye implicit deny (policy 0) ne drop kiya aur implicit logging enabled hone ki wajah se log hua`},{en:`The log is corrupted`,hi:`Log corrupt hai`},{en:`LAN-to-WAN denied SSH because it has logtraffic all`,hi:`LAN-to-WAN ne SSH deny kiya kyunki usme logtraffic all hai`}],a:1,w:{en:`The allowed services are HTTP, HTTPS, DNS and PING. SSH matches nothing, so it falls to the implicit deny, which is shown as policy 0 and only logged when fwpolicy-implicit-log is on.`,hi:`Allowed services HTTP, HTTPS, DNS aur PING hain. SSH kisi se match nahi karta, isliye implicit deny par girta hai, jo policy 0 dikhta hai aur tabhi log hota hai jab fwpolicy-implicit-log on ho.`}},{title:{en:`Which policy let marketing in?`,hi:`Marketing ko kaunsi policy ne andar jaane diya?`},ticket:{en:`After the fix, the auditor wants proof of which policy permitted the marketing PC session to the social site. Read the session entry.`,hi:`Fix ke baad auditor ko saboot chahiye ki marketing PC ke social site session ko kaunsi policy ne permit kiya. Session entry padho.`},out:`FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.20:57160       203.0.113.2:60001     198.51.100.10:443     -

FGT1 # diagnose sys session list
session info: proto=6 proto_state=01 duration=0 expire=3600 timeout=3600
hook=post dir=org act=snat 10.0.1.20:57160 to 198.51.100.10:443 (203.0.113.2:60001)
misc=0 policy_id=3 pol_uuid_idx=17 auth_info=0 chk_client_info=0 vd=0
total session 1`,q:{en:`Which policy accepted the session?`,hi:`Session ko kaunsi policy ne accept kiya?`},o:[{en:`Policy 1, BLOCK-SOCIAL`,hi:`Policy 1, BLOCK-SOCIAL`},{en:`Policy 2, LAN-to-WAN`,hi:`Policy 2, LAN-to-WAN`},{en:`The implicit deny`,hi:`Implicit deny`},{en:`Policy 3, MKT-SOCIAL (policy_id=3)`,hi:`Policy 3, MKT-SOCIAL (policy_id=3)`}],a:3,w:{en:`The verbose session entry records policy_id=3, the policy that accepted the first packet. The source NAT shown is applied by that policy.`,hi:`Verbose session entry policy_id=3 record karti hai, yaani us policy ko jisne pehla packet accept kiya. Jo source NAT dikhta hai woh usi policy se lagta hai.`}},{title:{en:`Silent after maintenance`,hi:`Maintenance ke baad sab shaant`},ticket:{en:`After a maintenance window, the LAN lost the internet. The engineer reviews the only allow policy. Read the output. What is wrong?`,hi:`Maintenance window ke baad LAN ka internet chala gaya. Engineer akeli allow policy review karta hai. Output padho. Kya galat hai?`},out:`FGT1 # show firewall policy 2
config firewall policy
    edit 2
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set nat enable
        set status disable
    next
end`,q:{en:`What is the problem and the fix?`,hi:`Problem kya hai aur fix kya hai?`},o:[{en:`The action must be deny`,hi:`Action deny hona chahiye`},{en:`The schedule is wrong`,hi:`Schedule galat hai`},{en:`The policy is disabled, so it is skipped; set status enable`,hi:`Policy disabled hai, isliye skip hoti hai; set status enable karo`},{en:`NAT should be disabled`,hi:`NAT disable hona chahiye`}],a:2,w:{en:`set status disable removes the policy from matching. Traffic then falls through to the next match, which here is the implicit deny. Re-enable it and verify with a lookup.`,hi:`set status disable policy ko matching se hata deta hai. Traffic phir agle match par girta hai, jo yahan implicit deny hai. Use dobara enable karo aur lookup se verify karo.`}}];export{e as default};