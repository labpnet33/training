var e=[{title:{en:`The priority queue that never fills`,hi:`Woh priority queue jo kabhi bharti nahi`},ticket:{en:`Pune branch: "Calls still break up during evening backups. The contractor says QoS is configured." WAN-OUT on Gi0/0 shows 0 packets in EF-Q while a call is active. You check the LAN interface.`,hi:`Pune branch: "Shaam ke backups ke dauran calls ab bhi toot-ti hain. Contractor kehta hai QoS configured hai." Call active hote hue Gi0/0 par WAN-OUT ke EF-Q mein 0 packets hain. Aap LAN interface check karte ho.`},out:`R1# show policy-map interface GigabitEthernet0/1
 GigabitEthernet0/1

  Service-policy output: MARK-IN

    Class-map: VOICE (match-any)
      0 packets, 0 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name VOICE-RTP
      QoS Set
        dscp ef
          Packets marked 0

    Class-map: BULK (match-all)
      0 packets, 0 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name BULK-SMB

    Class-map: class-default (match-any)
      412 packets, 30488 bytes
      30 second offered rate 1000 bps, drop rate 0000 bps
      Match: any`,q:{en:`What is the root cause?`,hi:`Root cause kya hai?`},o:[{en:`The VOICE-RTP ACL uses the wrong port range`,hi:`VOICE-RTP ACL galat port range use karta hai`},{en:`The priority rate in WAN-OUT is too small`,hi:`WAN-OUT mein priority rate bahut chhota hai`},{en:`MARK-IN is attached output on Gi0/1, so it never sees voice leaving the branch`,hi:`MARK-IN Gi0/1 par output attached hai, isliye yeh branch se nikalti voice kabhi nahi dekhti`},{en:`class-default must be removed from MARK-IN`,hi:`MARK-IN se class-default hatana hoga`}],a:2,w:{en:`The line "Service-policy output: MARK-IN" on the LAN interface is the giveaway. Output on Gi0/1 only touches packets going towards the phones, so outgoing voice is never marked EF and falls into class-default on the WAN. Fix: no service-policy output MARK-IN, then service-policy input MARK-IN.`,hi:`LAN interface par "Service-policy output: MARK-IN" line hi saboot hai. Gi0/1 par output sirf phones ki taraf jaane wale packets ko chhoota hai, isliye bahar jaati voice kabhi EF mark nahi hoti aur WAN par class-default mein girti hai. Fix: no service-policy output MARK-IN, phir service-policy input MARK-IN.`}},{title:{en:`Voice drops inside the priority class`,hi:`Priority class ke andar voice drops`},ticket:{en:`After adding 6 new phones, users report clipped audio at peak hours. Everything is marked EF correctly.`,hi:`6 naye phones jodne ke baad users peak hours mein kati hui audio report karte hain. Sab kuch sahi EF mark hai.`},out:`R1# show policy-map interface GigabitEthernet0/0 output
 GigabitEthernet0/0

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)
      402118 packets, 80423600 bytes
      30 second offered rate 1452000 bps, drop rate 452000 bps
      Match: dscp ef (46)
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 61240
      Queueing
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/61240/0
      (pkts output/bytes output) 340878/68175600`,q:{en:`What is the best fix?`,hi:`Sabse achha fix kya hai?`},o:[{en:`Raise the priority rate to cover peak call volume including overhead, for example priority 1600`,hi:`Overhead samet peak call volume cover karne ke liye priority rate badhao, jaise priority 1600`},{en:`Add random-detect to EF-Q`,hi:`EF-Q mein random-detect jodo`},{en:`Change priority 1000 to bandwidth 1000`,hi:`priority 1000 ko bandwidth 1000 mein badlo`},{en:`Move the policy to the input direction`,hi:`Policy ko input direction mein le jao`}],a:0,w:{en:`Offered EF is about 1.45 Mbps against a 1000 kbps priority rate, and the implicit LLQ policer drops the excess during congestion (b/w exceed drops). Size LLQ for peak calls. WRED on voice only adds drops, bandwidth would remove strict priority, and queuing cannot be input.`,hi:`Offered EF lagbhag 1.45 Mbps hai jabki priority rate 1000 kbps, aur implicit LLQ policer congestion mein extra drop karta hai (b/w exceed drops). LLQ ko peak calls ke liye size karo. Voice par WRED sirf drops badhata, bandwidth strict priority hata deta, aur queuing input nahi ho sakti.`}},{title:{en:`Signalling class with zero packets`,hi:`Zero packets wali signalling class`},ticket:{en:`Calls take several seconds to connect during busy periods. The engineer built one class for voice and call signalling.`,hi:`Busy samay mein calls connect hone mein kai seconds lete hain. Engineer ne voice aur call signalling ke liye ek class banayi.`},out:`R1# show class-map VOICE-ALL
 Class Map match-all VOICE-ALL (id 3)
   Match dscp ef (46)
   Match dscp cs3 (24)

R1# show policy-map interface GigabitEthernet0/0 output | section VOICE-ALL
    Class-map: VOICE-ALL (match-all)
      0 packets, 0 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps`,q:{en:`Why does the class never match?`,hi:`Class kabhi match kyun nahi hoti?`},o:[{en:`CS3 is not a valid DSCP name`,hi:`CS3 valid DSCP name nahi hai`},{en:`The class must be named class-default`,hi:`Class ka naam class-default hona chahiye`},{en:`DSCP cannot be matched on an output policy`,hi:`Output policy par DSCP match nahi ho sakta`},{en:`It is match-all, so a packet would need to be both EF and CS3 at once`,hi:`Yeh match-all hai, isliye packet ko ek saath EF aur CS3 dono hona padega`}],a:3,w:{en:`A class-map created without a keyword is match-all (AND). One packet carries one DSCP, so both lines can never be true. Use class-map match-any VOICE-ALL, or one line: match dscp ef cs3.`,hi:`Bina keyword ke bana class-map match-all (AND) hota hai. Ek packet ek hi DSCP le jaata hai, isliye dono lines kabhi sach nahi ho sakti. class-map match-any VOICE-ALL use karo, ya ek line: match dscp ef cs3.`}},{title:{en:`Policy refused on the LAN port`,hi:`LAN port par policy mana`},ticket:{en:`A junior engineer tries to "prioritise voice as early as possible" by attaching WAN-OUT to the LAN interface inbound.`,hi:`Ek junior engineer "voice ko jitna jaldi ho sake prioritise karne" ke liye WAN-OUT ko LAN interface par inbound attach karne ki koshish karta hai.`},out:`R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy input WAN-OUT
Queueing actions (priority, bandwidth, shape, fair-queue) are allowed only in the output direction
% Service policy WAN-OUT not attached to GigabitEthernet0/1 input`,q:{en:`What should the engineer do instead?`,hi:`Engineer ko iski jagah kya karna chahiye?`},o:[{en:`Replace priority with police in WAN-OUT and attach it input`,hi:`WAN-OUT mein priority ki jagah police lagao aur input attach karo`},{en:`Mark inbound on Gi0/1 with MARK-IN and queue outbound on the congested WAN Gi0/0 with WAN-OUT`,hi:`Gi0/1 par MARK-IN se inbound mark karo aur congested WAN Gi0/0 par WAN-OUT se outbound queue karo`},{en:`Attach WAN-OUT output on Gi0/1`,hi:`WAN-OUT ko Gi0/1 par output attach karo`},{en:`Enable fair-queue on the interface instead of MQC`,hi:`MQC ki jagah interface par fair-queue enable karo`}],a:1,w:{en:`Queuing only exists where packets wait to be transmitted, so it is output only. Classify and mark on the way in at the trust boundary, then queue at the egress of the slow link. Output on Gi0/1 would queue traffic towards the LAN, which is not congested.`,hi:`Queuing sirf wahan hoti hai jahan packets transmit hone ka intezaar karte hain, isliye yeh sirf output hai. Trust boundary par andar aate hi classify aur mark karo, phir slow link ke egress par queue karo. Gi0/1 par output LAN ki taraf traffic queue karta, jo congested nahi hai.`}},{title:{en:`Zero drops, broken calls`,hi:`Zero drops, tooti calls`},ticket:{en:`A branch buys a 50 Mbps service delivered on a 1 Gbps port. LLQ is configured on the WAN interface, but calls break up whenever backups run. The provider reports policer drops on the circuit.`,hi:`Ek branch 1 Gbps port par di gayi 50 Mbps service khareedti hai. WAN interface par LLQ configured hai, par backups chalte hi calls toot-ti hain. Provider circuit par policer drops report karta hai.`},out:`R1# show interfaces GigabitEthernet0/0 | include BW|output drops|rate
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
  Input queue: 0/375/0/0 (size/max/drops/flushes); Total output drops: 0
  5 minute output rate 71250000 bits/sec, 9120 packets/sec

R1# show policy-map interface GigabitEthernet0/0 output | include Class-map|drops
    Class-map: EF-Q (match-any)
      Priority: 15000 kbps, burst bytes 375000, b/w exceed drops: 0
      (queue depth/total drops/no-buffer drops) 0/0/0
    Class-map: class-default (match-any)
      (queue depth/total drops/no-buffer drops) 0/0/0`,q:{en:`What should be configured?`,hi:`Kya configure karna chahiye?`},o:[{en:`A larger priority rate in the existing policy`,hi:`Existing policy mein bada priority rate`},{en:`WRED in class-default`,hi:`class-default mein WRED`},{en:`A parent policy shaping class-default to 50 Mbps with the existing policy nested as a child`,hi:`class-default ko 50 Mbps par shape karne wali parent policy, existing policy child ki tarah nested`},{en:`An input policer of 50 Mbps on the WAN interface`,hi:`WAN interface par 50 Mbps ka input policer`}],a:2,w:{en:`The router sends 71 Mbps on a 1 Gbps interface that never congests, so LLQ never acts, while the provider polices at 50 Mbps without regard to DSCP. HQoS moves the bottleneck onto the router: shape average 50000000 in the parent, service-policy WAN-OUT beneath it.`,hi:`Router 1 Gbps interface par 71 Mbps bhejta hai jo kabhi congest nahi hota, isliye LLQ kabhi kaam nahi karti, jabki provider DSCP dekhe bina 50 Mbps par police karta hai. HQoS bottleneck ko router par le aata hai: parent mein shape average 50000000, uske neeche service-policy WAN-OUT.`}},{title:{en:`A PC that owns the priority queue`,hi:`Woh PC jo priority queue ka maalik hai`},ticket:{en:`At another branch, voice suffers even though EF-Q is sized for twice the call volume. The marking policy there only has VOICE and BULK classes.`,hi:`Ek aur branch par voice kharab hai jabki EF-Q call volume se dugni size ki hai. Wahan marking policy mein sirf VOICE aur BULK classes hain.`},out:`PC-DATA> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/5001   46    3000     60/60 112500    80114      28.8%
(* = still running)

R1# show policy-map interface GigabitEthernet0/0 output | section EF-Q
    Class-map: EF-Q (match-any)
      30 second offered rate 3400000 bps, drop rate 1400000 bps
      Priority: 2000 kbps, burst bytes 50000, b/w exceed drops: 52384`,q:{en:`What is the correct fix at the trust boundary?`,hi:`Trust boundary par sahi fix kya hai?`},o:[{en:`Increase the priority rate to 4000 kbps`,hi:`Priority rate 4000 kbps tak badhao`},{en:`Add class class-default with set dscp default to the inbound marking policy`,hi:`Inbound marking policy mein set dscp default ke saath class class-default jodo`},{en:`Remove the VOICE class`,hi:`VOICE class hatao`},{en:`Apply WRED to EF-Q`,hi:`EF-Q par WRED lagao`}],a:1,w:{en:`PC-DATA marks its own traffic DSCP 46. It matches neither VOICE nor BULK, so class-default passes the marking through unchanged and the PC fills the priority queue. Re-marking class-default to DSCP 0 at the trust boundary removes untrusted EF. Raising the priority rate would just reward the misbehaving PC.`,hi:`PC-DATA apna traffic khud DSCP 46 mark karta hai. Yeh na VOICE se match karta hai na BULK se, isliye class-default marking bina badle jaane deti hai aur PC priority queue bhar deta hai. Trust boundary par class-default ko DSCP 0 re-mark karna untrusted EF hata deta hai. Priority rate badhana sirf galat PC ko inaam dena hota.`}},{title:{en:`Wi-Fi handsets after the controller migration`,hi:`Controller migration ke baad Wi-Fi handsets`},ticket:{en:`After migrating to a Catalyst 9800, Wi-Fi phones break up at busy times while desk phones are fine. Captures show the handsets' CAPWAP traffic with DSCP 0.`,hi:`Catalyst 9800 par migrate karne ke baad busy samay mein Wi-Fi phones toot-te hain jabki desk phones theek hain. Captures mein handsets ka CAPWAP traffic DSCP 0 ke saath dikhta hai.`},out:`WLC# show wireless profile policy detailed VOICE-PP
Policy Profile Name                 : VOICE-PP
Description                         : voice handsets
Status                              : ENABLED
...
QOS per SSID
  Ingress Service Name              : silver-up
  Egress Service Name               : silver`,q:{en:`What should be changed?`,hi:`Kya badalna chahiye?`},o:[{en:`Apply platinum and platinum-up as the SSID QoS policies in VOICE-PP`,hi:`VOICE-PP mein SSID QoS policies ke roop mein platinum aur platinum-up lagao`},{en:`Apply bronze to reduce contention`,hi:`Contention kam karne ke liye bronze lagao`},{en:`Disable WMM on the WLAN`,hi:`WLAN par WMM disable karo`},{en:`Mark the handsets CoS 5 on the AP switch port`,hi:`AP switch port par handsets ko CoS 5 mark karo`}],a:0,w:{en:`Silver caps traffic to best effort, so voice gets UP 0 on the air and DSCP 0 in the CAPWAP header. Platinum is the voice profile and allows EF / UP 6. Disabling WMM removes Wi-Fi QoS entirely, and bronze makes it worse.`,hi:`Silver traffic ko best effort tak cap karta hai, isliye voice ko hawa mein UP 0 aur CAPWAP header mein DSCP 0 milta hai. Platinum voice profile hai aur EF / UP 6 allow karta hai. WMM disable karna Wi-Fi QoS poori tarah hata deta hai, aur bronze ise aur bura karta hai.`}},{title:{en:`A 10 Mbps policer that delivers 3 Mbps`,hi:`10 Mbps policer jo 3 Mbps deta hai`},ticket:{en:`A partner link is policed to 10 Mbps. TCP file transfers never exceed about 3 Mbps, and the exceeded counter grows constantly.`,hi:`Ek partner link 10 Mbps par policed hai. TCP file transfers lagbhag 3 Mbps se kabhi aage nahi jaate, aur exceeded counter lagatar badhta hai.`},out:`R1# show policy-map interface GigabitEthernet0/2 input
    Class-map: PARTNER (match-all)
      30 second offered rate 3120000 bps, drop rate 210000 bps
      police:
          cir 10000000 bps, bc 1500 bytes
        conformed 1841260 packets, 2577764000 bytes; actions:
          transmit
        exceeded 138022 packets, 193230800 bytes; actions:
          drop
        conformed 2910000 bps, exceeded 210000 bps`,q:{en:`What is the problem?`,hi:`Problem kya hai?`},o:[{en:`The CIR is configured in kbps instead of bps`,hi:`CIR bps ki jagah kbps mein configured hai`},{en:`Policers cannot be applied inbound`,hi:`Policers inbound nahi lagaye ja sakte`},{en:`The class should use match-any`,hi:`Class ko match-any use karna chahiye`},{en:`Bc of 1500 bytes allows only one packet per burst, so TCP keeps seeing loss and backing off`,hi:`1500 bytes ka Bc ek burst mein sirf ek packet allow karta hai, isliye TCP ko baar baar loss dikhta hai aur woh peeche hat-ta hai`}],a:3,w:{en:`Even far below the CIR, a one-packet bucket drops any back-to-back packets, and TCP halves its window each time. Use the default (CIR/32 = 312,500 bytes) or about 1.5 s of traffic for TCP (1,875,000 bytes), or shape instead of police if the traffic is yours.`,hi:`CIR se kaafi neeche bhi, ek-packet bucket lagataar aane wale packets drop karta hai, aur TCP har baar apni window aadhi karta hai. Default (CIR/32 = 312,500 bytes) ya TCP ke liye lagbhag 1.5 s ka traffic (1,875,000 bytes) use karo, ya traffic aapka ho to police ki jagah shape karo.`}}];export{e as default};