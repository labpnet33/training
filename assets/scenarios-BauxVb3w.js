var e=[{title:{en:`Voice policy is active but DSCP is never marked`,hi:`Voice policy active hai lekin DSCP kabhi mark nahi hota`},ticket:{en:`Pune help desk: "Voice calls leave E-BR1 with DSCP 0." The policy DP-PUNE marks voice as DSCP 46 and was activated this morning. You check the edge.`,hi:`Pune help desk: "Voice calls E-BR1 se DSCP 0 ke saath nikalti hain." Policy DP-PUNE voice ko DSCP 46 mark karti hai aur aaj subah activate hui thi. Aap edge check karte ho.`},out:`E-BR1# show sdwan policy from-vsmart
from-vsmart data-policy DP-PUNE
 direction from-tunnel
 vpn-list CORP
  sequence 10
   match
    app-list VOICE-APPS
   action accept
    count VOICE-PKTS
    set
     dscp 46

E-BR1# show sdwan policy data-policy-filter
data-policy-filter DP-PUNE
 data-policy-vpnlist CORP
  data-policy-counter VOICE-PKTS
   packets  0
   bytes    0`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Add restrict to the DSCP action`,hi:`DSCP action mein restrict jodo`},{en:`Increase the BFD poll interval`,hi:`BFD poll interval badhao`},{en:`Apply DP-PUNE from-service on the Controller and re-activate`,hi:`Controller par DP-PUNE ko from-service apply karo aur re-activate karo`},{en:`Add the voice app-list to a control policy`,hi:`Voice app-list ko control policy mein jodo`}],a:2,w:{en:`The policy arrived but its direction is from-tunnel, so it only sees packets coming from the overlay. Voice enters E-BR1 from the LAN, which is from-service. The counter at zero proves the sequence never matched.`,hi:`Policy pahunch gayi lekin uski direction from-tunnel hai, isliye woh sirf overlay se aane wale packets dekhti hai. Voice E-BR1 mein LAN se enter hoti hai, yaani from-service. Zero counter saabit karta hai ki sequence kabhi match hi nahi hua.`}},{title:{en:`Voice stays on a failing internet tunnel for twenty minutes`,hi:`Voice bees minute tak fail hote internet tunnel par rehti hai`},ticket:{en:`A brownout began on the internet circuit at 10:00. Users report choppy voice until about 10:20, even though AAR is configured with SLA VOICE (loss 1, latency 150, jitter 30) and preferred-color mpls. MPLS is clean.`,hi:`Internet circuit par 10:00 baje brownout shuru hua. Users 10:20 ke aaspaas tak choppy voice report karte hain, jabki AAR SLA VOICE (loss 1, latency 150, jitter 30) aur preferred-color mpls ke saath configured hai. MPLS saaf hai.`},out:`E-BR1# show sdwan app-route stats remote-system-ip 10.255.0.1
app-route statistics 203.0.113.10 203.0.113.6 ipsec 12346 12346
 local-color              biz-internet
 remote-color             biz-internet
 mean-loss                0
 mean-latency             61
 mean-jitter              8
 sla-class-index          0,1,2

E-BR1# show running-config | section bfd
sdwan
 bfd app-route multiplier 6
 bfd app-route poll-interval 600000
 bfd color biz-internet
  hello-interval 1000
  multiplier 7`,q:{en:`Why was the reaction slow?`,hi:`Reaction slow kyun tha?`},o:[{en:`The BFD multiplier of 7 is too high for loss detection`,hi:`Loss detection ke liye BFD multiplier 7 bahut zyada hai`},{en:`The Controller only evaluates SLA every 20 minutes`,hi:`Controller sirf har 20 minute mein SLA evaluate karta hai`},{en:`MPLS is not listed in the app-list`,hi:`MPLS app-list mein listed nahi hai`},{en:`With a 10-minute poll interval and 6 buckets, a short brownout is averaged with five good buckets and takes time to cross the SLA`,hi:`10-minute poll interval aur 6 buckets ke saath, chhota brownout paanch achchhe buckets ke saath average hota hai aur SLA paar karne mein time leta hai`}],a:3,w:{en:`AAR is decided on the edge from bucketed BFD averages. With default timers one bad bucket is diluted. Reduce poll interval and multiplier together (for example 2 minutes and 5), keep enough hellos per bucket, and test for flapping. The BFD multiplier only governs tunnel liveness.`,hi:`AAR ka decision edge par bucketed BFD averages se hota hai. Default timers ke saath ek kharab bucket dilute ho jaata hai. Poll interval aur multiplier ko saath chhota karo (jaise 2 minutes aur 5), har bucket mein kaafi hellos rakho, aur flapping ke liye test karo. BFD multiplier sirf tunnel liveness chalata hai.`}},{title:{en:`Hyderabad edge never receives the policy`,hi:`Hyderabad edge ko policy kabhi nahi milti`},ticket:{en:`A new app-route policy was activated at 6 pm for the south sites. Pune moved voice to MPLS, Hyderabad did not. You log in to the Hyderabad edge E-HYD-1 (site 400).`,hi:`Shaam 6 baje south sites ke liye nayi app-route policy activate hui. Pune ki voice MPLS par chali gayi, Hyderabad ki nahi. Aap Hyderabad edge E-HYD-1 (site 400) par login karte ho.`},out:`E-HYD-1# show sdwan control connections
PEER    PEER  PEER           SITE  DOMAIN  STATE
TYPE    PROT  SYSTEM IP      ID    ID
vsmart  dtls  10.255.255.2   1     1       up
vbond   dtls  10.255.255.3   0     0       up
vmanage dtls  10.255.255.1   1     0       up

E-HYD-1# show sdwan policy from-vsmart
% No entries found.

VSMART# show running-config apply-policy
apply-policy
 site-list SOUTH
  app-route-policy AAR-SOUTH
 !
VSMART# show running-config policy lists site-list SOUTH
policy
 lists
  site-list SOUTH
   site-id 200-300
  !`,q:{en:`What is wrong?`,hi:`Kya galat hai?`},o:[{en:`The DTLS control connection to the Controller is down`,hi:`Controller tak DTLS control connection down hai`},{en:`Site 400 is not in the site-list SOUTH, so the Controller never sent the policy there`,hi:`Site 400 site-list SOUTH mein nahi hai, isliye Controller ne policy wahan bheji hi nahi`},{en:`The policy needs a direction on apply-policy`,hi:`Policy ko apply-policy par direction chahiye`},{en:`The SLA class index is missing on the edge`,hi:`Edge par SLA class index missing hai`}],a:1,w:{en:`The control connection is up and the Controller has the policy, but the site-list covers site IDs 200 to 300 only. Hyderabad is site 400, so it is not a target. Add it (without overlapping other lists), re-activate, and from-vsmart will populate. App-route policies need no direction.`,hi:`Control connection up hai aur Controller ke paas policy hai, lekin site-list sirf site IDs 200 se 300 cover karti hai. Hyderabad site 400 hai, isliye woh target nahi. Use jodo (doosri lists se overlap kiye bina), re-activate karo, aur from-vsmart populate ho jaayega. App-route policies ko direction nahi chahiye.`}},{title:{en:`Billing traffic drops when MPLS has a bad hour`,hi:`MPLS ka bura ghanta aate hi billing traffic drop ho jaata hai`},ticket:{en:`During an MPLS brownout the Pune billing application stopped completely, although the internet tunnel was up. The policy for billing uses sla-class BILLING (loss 2, latency 250).`,hi:`MPLS brownout ke dauran Pune ki billing application poori band ho gayi, jabki internet tunnel up tha. Billing ki policy sla-class BILLING (loss 2, latency 250) use karti hai.`},out:`E-BR1# show sdwan policy from-vsmart | begin app-route-policy
from-vsmart app-route-policy AAR-PUNE
 vpn-list CORP
  sequence 20
   match
    app-list BILLING-APPS
   action
    sla-class BILLING strict
    preferred-color mpls

E-BR1# show sdwan app-route stats remote-system-ip 10.255.0.1
 local-color              mpls
 mean-loss                3
 sla-class-index          0
 local-color              biz-internet
 mean-latency             270
 sla-class-index          0`,q:{en:`Why was billing dropped?`,hi:`Billing drop kyun hui?`},o:[{en:`Preferred-color mpls blocks all other colors`,hi:`Preferred-color mpls baaki saare colors block karta hai`},{en:`The BILLING class has no jitter value`,hi:`BILLING class mein jitter value nahi hai`},{en:`strict drops traffic when no tunnel meets the SLA, and both tunnels fail BILLING`,hi:`strict tab traffic drop karta hai jab koi tunnel SLA meet na kare, aur dono tunnels BILLING fail kar rahe hain`},{en:`BFD declared both tunnels down`,hi:`BFD ne dono tunnels down declare kar diye`}],a:2,w:{en:`MPLS shows 3% loss (fails loss 2) and the internet tunnel shows 270 ms (fails latency 250); neither lists index for BILLING. With strict the edge drops. Remove strict (or add fallback best tunnel / backup-sla-preferred-color) unless dropping is deliberate.`,hi:`MPLS par 3% loss hai (loss 2 fail) aur internet tunnel par 270 ms (latency 250 fail); kisi ki list mein BILLING ka index nahi. strict ke saath edge drop karta hai. Jab tak drop karna jaanbujh kar na ho, strict hatao (ya fallback best tunnel / backup-sla-preferred-color jodo).`}},{title:{en:`Backups still use MPLS`,hi:`Backups ab bhi MPLS use karte hain`},ticket:{en:`Nightly backups from Pune were meant to leave on biz-internet by data policy, but MPLS is still saturated at 2 am.`,hi:`Pune ke raat ke backups data policy se biz-internet par nikalne the, lekin raat 2 baje MPLS ab bhi saturated hai.`},out:`E-BR1# show sdwan policy from-vsmart
from-vsmart data-policy DP-PUNE
 direction from-service
 vpn-list GUEST
  sequence 30
   match
    app-list BACKUP-APPS
   action accept
    set
     local-tloc-list
      color biz-internet
      encap ipsec

from-vsmart lists vpn-list GUEST
 vpn 20

E-BR1# show sdwan policy service-path vpn 10 interface GigabitEthernet3 source-ip 10.1.10.10 dest-ip 10.100.0.20 protocol 6 dest-port 873
 Next Hop: IPsec
  Local Color: mpls Remote Color: mpls Remote System IP: 10.255.0.1`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`The policy is attached to vpn-list GUEST (VPN 20) but the backups run in VPN 10`,hi:`Policy vpn-list GUEST (VPN 20) se attached hai jabki backups VPN 10 mein chalte hain`},{en:`local-tloc-list needs encap gre`,hi:`local-tloc-list ko encap gre chahiye`},{en:`The direction must be from-tunnel`,hi:`Direction from-tunnel honi chahiye`},{en:`The backup application is not allowed on biz-internet`,hi:`Backup application biz-internet par allowed nahi hai`}],a:0,w:{en:`The service-path for a VPN 10 flow still chooses MPLS because the sequence lives under a vpn-list that contains only VPN 20. Fix the vpn-list (use CORP, VPN 10) and re-activate; the service-path should then show biz-internet.`,hi:`VPN 10 ke flow ka service-path abhi bhi MPLS chunta hai kyunki sequence aise vpn-list ke neeche hai jisme sirf VPN 20 hai. vpn-list theek karo (CORP, VPN 10 use karo) aur re-activate karo; phir service-path mein biz-internet dikhna chahiye.`}},{title:{en:`Guest drop rule never counts`,hi:`Guest drop rule kabhi count nahi karta`},ticket:{en:`Security found a guest laptop (10.1.20.50) talking to a server in 10.100.0.0/24. A drop sequence exists in the data policy.`,hi:`Security ko ek guest laptop (10.1.20.50) 10.100.0.0/24 ke server se baat karta mila. Data policy mein drop sequence maujood hai.`},out:`E-BR1# show sdwan policy data-policy-filter
data-policy-filter DP-PUNE
 data-policy-vpnlist CORP
  data-policy-counter ALLOW-CORP
   packets  90412
  data-policy-counter GUEST-BLOCKED
   packets  0

E-BR1# show sdwan policy from-vsmart | include sequence|source|destination|action
  sequence 10
    source-data-prefix-list CORP-ALL
   action accept
  sequence 20
    source-data-prefix-list GUEST-NET
    destination-data-prefix-list DC-NET
   action drop`,q:{en:`How do you fix it?`,hi:`Ise kaise theek karoge?`},o:[{en:`Add log to sequence 10`,hi:`Sequence 10 mein log jodo`},{en:`Change the default-action to drop`,hi:`default-action ko drop karo`},{en:`Apply the policy from-tunnel`,hi:`Policy ko from-tunnel apply karo`},{en:`Move the guest drop sequence before sequence 10, because CORP-ALL (which includes 10.1.20.0/24) matches first`,hi:`Guest drop sequence ko sequence 10 se pehle rakho, kyunki CORP-ALL (jisme 10.1.20.0/24 shamil hai) pehle match ho jaata hai`}],a:3,w:{en:`First match wins. ALLOW-CORP counts the guest packets because the broad source prefix list covers the guest subnet. Number the specific security drop lower (for example sequence 5) and re-check that GUEST-BLOCKED increases.`,hi:`Pehla match jeetta hai. ALLOW-CORP guest packets count kar raha hai kyunki broad source prefix list guest subnet ko cover karti hai. Specific security drop ko chhota number do (jaise sequence 5) aur dobara dekho ki GUEST-BLOCKED badhta hai.`}},{title:{en:`The ACL hides the policy`,hi:`ACL policy ko chhupa leti hai`},ticket:{en:`The new data policy that counts TCP 443 from 10.1.10.0/24 shows zero hits, yet users browse fine. A localized ACL was added to the LAN interface last week.`,hi:`Nayi data policy jo 10.1.10.0/24 se TCP 443 count karti hai zero hits dikhati hai, phir bhi users browse kar rahe hain. Pichhle hafte LAN interface par localized ACL jodi gayi thi.`},out:`E-BR1# show sdwan policy data-policy-filter
  data-policy-counter HTTPS-COUNT
   packets  0

E-BR1# show ip access-lists LAN-IN
Extended IP access list LAN-IN
    10 permit tcp 10.1.10.0 0.0.0.255 any eq 443 (4210 matches)
    20 permit icmp any any
    30 deny ip any any

E-BR1# show sdwan policy from-vsmart | include direction|vpn
 direction from-tunnel
  vpn 10`,q:{en:`Which statement is correct?`,hi:`Kaunsa statement sahi hai?`},o:[{en:`The ACL is the problem: it is evaluated first and permits the traffic, so the counter being zero is not caused by the ACL`,hi:`ACL problem hai: woh pehle evaluate hoti hai aur traffic permit karti hai, isliye zero counter ACL ki wajah se nahi`},{en:`The policy is applied from-tunnel, so it never sees LAN traffic; the ACL permits the traffic and is evaluated before the centralized policy`,hi:`Policy from-tunnel apply hai, isliye woh LAN traffic kabhi nahi dekhti; ACL traffic permit karti hai aur centralized policy se pehle evaluate hoti hai`},{en:`Centralized policy is evaluated before the ingress ACL`,hi:`Centralized policy ingress ACL se pehle evaluate hoti hai`},{en:`HTTPS cannot be matched by a data policy`,hi:`HTTPS ko data policy match nahi kar sakti`}],a:1,w:{en:`The ACL counters show HTTPS is permitted, so it passes the first stage. The policy direction is from-tunnel, so the counter stays zero. Change to from-service. The ACL is evaluated first, but here it is not the culprit.`,hi:`ACL counters dikhate hain ki HTTPS permitted hai, isliye woh pehla stage paar karta hai. Policy direction from-tunnel hai, isliye counter zero rehta hai. from-service par badlo. ACL pehle evaluate hoti hai, lekin yahan wahi doshi nahi hai.`}},{title:{en:`Choppy voice on a single lossy link`,hi:`Ek lossy link par choppy voice`},ticket:{en:`The Nashik kiosk has only broadband with about 2% loss. AAR cannot help. The engineer added a loss-protect action for voice and wants proof.`,hi:`Nashik kiosk ke paas sirf broadband hai jisme lagbhag 2% loss hai. AAR madad nahi kar sakta. Engineer ne voice ke liye loss-protect action jodi aur saboot chahta hai.`},out:`E-NSK-1# show sdwan tunnel statistics fec
tunnel stats ipsec 203.0.113.18 203.0.113.6 12346 12346
 fec-tx-data-pkts      40220
 fec-tx-parity-pkts    10055
 fec-rx-data-pkts      39870
 fec-rx-parity-pkts    9968
 fec-reconstruct-pkts  611`,q:{en:`What does this output prove?`,hi:`Yeh output kya saabit karta hai?`},o:[{en:`Packets are being retransmitted by TCP`,hi:`TCP packets retransmit kar raha hai`},{en:`Voice packets are duplicated on a second tunnel`,hi:`Voice packets doosre tunnel par duplicate ho rahe hain`},{en:`One parity packet is sent per four data packets and 611 lost packets were rebuilt without retransmission`,hi:`Har chaar data packets par ek parity packet ja raha hai aur 611 lost packets bina retransmission ke rebuild hue`},{en:`FEC is disabled because parity packets are non-zero`,hi:`FEC disabled hai kyunki parity packets non-zero hain`}],a:2,w:{en:`Parity is about a quarter of data (10055 / 40220), and fec-reconstruct-pkts counts packets rebuilt at the receiver. Duplication would use the pkt-dup counters instead.`,hi:`Parity data ka lagbhag ek chauthai hai (10055 / 40220), aur fec-reconstruct-pkts receiver par rebuild hue packets ginta hai. Duplication pkt-dup counters use karta.`}}];export{e as default};