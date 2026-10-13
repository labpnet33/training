var e=[{title:{en:`Policy written backwards`,hi:`Ulti likhi policy`},ticket:{en:`A new branch cannot browse. The firewall has addresses, a default route and one policy. Read the output. What is wrong?`,hi:`Naya branch browse nahi kar paa raha. Firewall par addresses, default route aur ek policy hai. Output padho. Kya galat hai?`},out:`NK-PUNE-FGT # show firewall policy
config firewall policy
    edit 1
        set name "LAN-to-WAN"
        set srcintf "port1"
        set dstintf "port2"
        set action accept
        set nat enable
    next
end

PC1> ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
8.8.8.8 icmp_seq=2 timeout
8.8.8.8 icmp_seq=3 timeout
8.8.8.8 icmp_seq=4 timeout
8.8.8.8 icmp_seq=5 timeout

NK-PUNE-FGT # diagnose sys session list
total session 0`,q:{en:`Why is nothing passing?`,hi:`Kuch pass kyun nahi ho raha?`},o:[{en:`NAT must be disabled for LAN traffic`,hi:`LAN traffic ke liye NAT disable hona chahiye`},{en:`The session table is full`,hi:`Session table bhari hui hai`},{en:`The policy runs from port1 to port2, the opposite of the LAN-to-internet direction`,hi:`Policy port1 se port2 ki hai, yani LAN se internet ke ulta direction`},{en:`The action should be deny`,hi:`Action deny hona chahiye`}],a:2,w:{en:`Policies are directional. LAN traffic arrives on port2 and leaves through port1, so the policy needs srcintf port2 and dstintf port1. The empty session table shows no packet matched any policy.`,hi:`Policies directional hoti hain. LAN traffic port2 par aata hai aur port1 se jaata hai, isliye policy mein srcintf port2 aur dstintf port1 chahiye. Khali session table dikhata hai ki koi packet kisi policy se match nahi hua.`}},{title:{en:`The firewall has no way out`,hi:`Firewall ke paas bahar jaane ka rasta nahi`},ticket:{en:`The policy is correct, yet the firewall cannot even ping 8.8.8.8 from its own CLI. Look at the routing table.`,hi:`Policy sahi hai, phir bhi firewall apne CLI se 8.8.8.8 ko ping nahi kar paata. Routing table dekho.`},out:`NK-PUNE-FGT # get router info routing-table all
Routing table for VRF=0
C       10.0.1.0/24 is directly connected, port2
C       203.0.113.0/30 is directly connected, port1

NK-PUNE-FGT # execute ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
--- 8.8.8.8 ping statistics ---
5 packets transmitted, 0 packets received, 100% packet loss`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`A default route via the ISP gateway`,hi:`ISP gateway ke through default route`},{en:`A firewall policy for the WAN`,hi:`WAN ke liye firewall policy`},{en:`The HTTPS admin service on port1`,hi:`port1 par HTTPS admin service`},{en:`A second connected route`,hi:`Doosra connected route`}],a:0,w:{en:`There is no S* line. Only connected routes exist, so the firewall has no next hop for 8.8.8.8. Add a static route with gateway 203.0.113.1 on port1.`,hi:`S* line nahi hai. Sirf connected routes hain, isliye firewall ke paas 8.8.8.8 ke liye next hop nahi. port1 par gateway 203.0.113.1 ke saath static route add karo.`}},{title:{en:`NAT switched off`,hi:`NAT band hai`},ticket:{en:`The PC gets "Destination host unreachable". The session below was created. What explains it?`,hi:`PC ko "Destination host unreachable" milta hai. Neeche wala session ban gaya. Kya samjhata hai?`},out:`NK-PUNE-FGT # diagnose sys session list
statistic(bytes/packets/allow_err): org=520/5/1 reply=0/0/1 tuples=2
hook=pre dir=org act=noop 10.0.1.10:19499->8.8.8.8:8(0.0.0.0:0)
hook=pre dir=reply act=noop 8.8.8.8:19499->10.0.1.10:0(0.0.0.0:0)
misc=0 policy_id=1 pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0
total session 1

NK-PUNE-FGT # show firewall policy
config firewall policy
    edit 1
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set service "ALL"
    next
end`,q:{en:`What is the fix?`,hi:`Fix kya hai?`},o:[{en:`Add a second policy for the return traffic`,hi:`Return traffic ke liye doosri policy add karo`},{en:`Change the action to deny`,hi:`Action ko deny karo`},{en:`Clear the ARP table`,hi:`ARP table clear karo`},{en:`Enable NAT in policy 1`,hi:`Policy 1 mein NAT enable karo`}],a:3,w:{en:`The session shows act=noop on both lines and reply=0 packets: the private source 10.0.1.10 left unchanged and the ISP could not return the reply. The policy has no set nat enable line. Enable NAT (set nat enable) so the source becomes the WAN address.`,hi:`Session dono lines par act=noop aur reply=0 packets dikhata hai: private source 10.0.1.10 bina badle gaya aur ISP reply return nahi kar paya. Policy mein set nat enable line nahi hai. NAT enable karo (set nat enable) taaki source WAN address ban jaye.`}},{title:{en:`The policy that is switched off`,hi:`Band ki hui policy`},ticket:{en:`Everything looks right, but the PC times out. Spot the line that explains it.`,hi:`Sab sahi dikhta hai, phir bhi PC timeout hota hai. Woh line dhoondho jo samjhati hai.`},out:`NK-PUNE-FGT # show firewall policy
config firewall policy
    edit 1
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
end

PC1> ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
8.8.8.8 icmp_seq=2 timeout
8.8.8.8 icmp_seq=3 timeout
8.8.8.8 icmp_seq=4 timeout
8.8.8.8 icmp_seq=5 timeout`,q:{en:`What is the cause?`,hi:`Cause kya hai?`},o:[{en:`The schedule is wrong`,hi:`Schedule galat hai`},{en:`The policy status is disable, so it never matches`,hi:`Policy status disable hai, isliye woh kabhi match nahi karti`},{en:`The service ALL is not allowed`,hi:`Service ALL allowed nahi hai`},{en:`The srcaddr must not be all`,hi:`srcaddr all nahi hona chahiye`}],a:1,w:{en:`A disabled policy is skipped during policy lookup, so the implicit deny drops the packet. Set status enable.`,hi:`Disabled policy policy lookup mein skip hoti hai, isliye implicit deny packet drop kar deta hai. status enable karo.`}},{title:{en:`Denied, but still connected`,hi:`Deny hai, phir bhi connected`},ticket:{en:`At 14:00 policy 1 was changed to deny. A user at 14:05 still has traffic flowing. The output is from 14:05.`,hi:`14:00 baje policy 1 deny ki gayi. 14:05 par ek user ka traffic abhi bhi chal raha hai. Output 14:05 ka hai.`},out:`NK-PUNE-FGT # show firewall policy
config firewall policy
    edit 1
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end

NK-PUNE-FGT # diagnose sys session list
statistic(bytes/packets/allow_err): org=1040/10/1 reply=1040/10/1 tuples=2
hook=post dir=org act=snat 10.0.1.10:19499->8.8.8.8:8(203.0.113.2:40001)
misc=0 policy_id=1 pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0
total session 1`,q:{en:`Why is traffic still passing?`,hi:`Traffic abhi bhi kyun pass ho raha hai?`},o:[{en:`The deny action is not saved`,hi:`Deny action save nahi hui`},{en:`An existing session keeps matching; clear it to apply the deny`,hi:`Existing session match karta rehta hai; deny lagu karne ke liye use clear karo`},{en:`FortiOS needs a commit`,hi:`FortiOS ko commit chahiye`},{en:`The policy order is wrong`,hi:`Policy order galat hai`}],a:1,w:{en:`There is no set action line because deny is the default, so the change is saved. The session created under the old accept keeps matching without a new policy lookup. Clear that session (with a filter, in a change window) so the next packet is evaluated.`,hi:`set action line nahi hai kyunki deny default hai, isliye change save ho chuka hai. Purani accept ke tehat bana session bina naye policy lookup ke match karta rehta hai. Us session ko clear karo (filter ke saath, change window mein) taaki agla packet evaluate ho.`}},{title:{en:`Users browse, nobody opens the GUI`,hi:`Users browse karte hain, GUI koi nahi khol pata`},ticket:{en:`The LAN interface is shown below. PCs reach the internet but the admin cannot open the FortiGate GUI or ping the gateway.`,hi:`LAN interface neeche hai. PCs internet tak pahunchte hain par admin FortiGate GUI nahi khol pata aur gateway ko ping bhi nahi kar pata.`},out:`NK-PUNE-FGT # show system interface port2
config system interface
    edit "port2"
        set vdom "root"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess ssh
        set type physical
        set alias "LAN"
        set role lan
    next
end

PC1> ping 10.0.1.1
10.0.1.1 icmp_seq=1 timeout
10.0.1.1 icmp_seq=2 timeout
10.0.1.1 icmp_seq=3 timeout
10.0.1.1 icmp_seq=4 timeout
10.0.1.1 icmp_seq=5 timeout
PC1> ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms`,q:{en:`Which change is correct?`,hi:`Kaunsa change sahi hai?`},o:[{en:`Add a policy from port2 to port2`,hi:`port2 se port2 ki policy add karo`},{en:`Change the role to wan`,hi:`Role ko wan karo`},{en:`Enable NAT on port2`,hi:`port2 par NAT enable karo`},{en:`Append ping and the HTTPS admin service to allowaccess on port2`,hi:`port2 ke allowaccess mein ping aur HTTPS admin service append karo`}],a:3,w:{en:`Traffic to the firewall itself is governed by allowaccess, not by forward policies. Only ssh is allowed on port2. Use append so ssh is kept; set would replace the list.`,hi:`Firewall tak jaane wala traffic allowaccess se govern hota hai, forward policies se nahi. port2 par sirf ssh allowed hai. append use karo taaki ssh bana rahe; set list replace kar deta.`}},{title:{en:`The setting that show hides`,hi:`Woh setting jo show chhupata hai`},ticket:{en:`An engineer says the zone has no intrazone setting. Both outputs are real. What should he conclude?`,hi:`Engineer kehta hai zone mein intrazone setting nahi hai. Dono outputs asli hain. Use kya nishkarsh nikalna chahiye?`},out:`NK-PUNE-FGT # show system zone
config system zone
    edit "LAN-ZONE"
        set interface "VLAN10" "VLAN20"
    next
end

NK-PUNE-FGT # show full-configuration system zone
config system zone
    edit "LAN-ZONE"
        set description ""
        set intrazone deny
        set interface "VLAN10" "VLAN20"
    next
end`,q:{en:`What is the correct conclusion?`,hi:`Sahi nishkarsh kya hai?`},o:[{en:`The default intrazone deny is active but hidden by show`,hi:`Default intrazone deny active hai par show ne chhupa diya`},{en:`The setting is unset and traffic between members is allowed`,hi:`Setting unset hai aur members ke beech traffic allowed hai`},{en:`The second command is wrong`,hi:`Doosra command galat hai`},{en:`The zone is disabled`,hi:`Zone disabled hai`}],a:0,w:{en:`show lists only non-default values. show full-configuration reveals that intrazone is deny, the default, which blocks traffic between members of the zone.`,hi:`show sirf non-default values dikhata hai. show full-configuration batata hai ki intrazone deny hai, jo default hai aur zone ke members ke beech traffic block karta hai.`}}];export{e as default};