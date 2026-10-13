var e=[{title:{en:`Policy applied, counters at zero`,hi:`Policy lagi hai, counters zero hain`},ticket:{en:`"Calls from the Pune phones are robotic in the evening. The contractor says MARK-IN is applied to the LAN port and everything is configured." On R1 you check the LAN port.`,hi:`"Pune ke phones ki calls shaam ko robotic hain. Contractor kehta hai MARK-IN LAN port par lagi hai aur sab configure hai." R1 par aap LAN port check karte ho.`},out:`R1# show policy-map interface GigabitEthernet0/1
 GigabitEthernet0/1 

  Service-policy output: MARK-IN

    Class-map: VOICE (match-any)  
      0 packets, 0 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name VOICE-RTP
        0 packets, 0 bytes
        30 second rate 0000 bps
      QoS Set
        dscp ef
          Packets marked 0

    Class-map: class-default (match-any)  
      0 packets, 0 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 

PHONE> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  0     400      20/20 5000      4664       6.7%`,q:{en:`What is the first thing to fix?`,hi:`Sabse pehle kya fix karna chahiye?`},o:[{en:`Increase the WAN priority rate`,hi:`WAN priority rate badhao`},{en:`Remove the output attachment and attach MARK-IN as service-policy input on Gi0/1`,hi:`Output attachment hatao aur MARK-IN ko Gi0/1 par service-policy input ki tarah attach karo`},{en:`Add random-detect to class-default`,hi:`class-default mein random-detect jodo`},{en:`Change the class-map to match-all`,hi:`Class-map ko match-all karo`}],a:1,w:{en:`The header says "Service-policy output". Traffic from the LAN enters Gi0/1, so an output policy there sees nothing: both classes show 0 packets. Marking belongs on input. (The ACL should be checked after the direction is fixed.) WAN rate, WRED and match-all do not change what the LAN port sees.`,hi:`Header kehta hai "Service-policy output". LAN ka traffic Gi0/1 mein andar aata hai, isliye wahan ki output policy kuch nahi dekhti: dono classes 0 packets dikhati hain. Marking input par hoti hai. (Direction theek hone ke baad ACL check karo.) WAN rate, WRED aur match-all se LAN port ko jo dikhta hai woh nahi badalta.`}},{title:{en:`Voice lands in class-default`,hi:`Voice class-default mein ja rahi hai`},ticket:{en:`"The marking policy is on the LAN input, yet the EF queue on the WAN stays empty and calls break up." You read the ACL and the counters on R1. The phones send RTP from UDP port 20000.`,hi:`"Marking policy LAN input par hai, phir bhi WAN par EF queue khali rehti hai aur calls toot-ti hain." Aap R1 par ACL aur counters padhte ho. Phones UDP port 20000 se RTP bhejte hain.`},out:`R1# show access-lists
Extended IP access list VOICE-RTP
    10 permit udp 10.10.10.0 0.0.0.255 any range 30000 32767

R1# show policy-map interface GigabitEthernet0/1 input
 GigabitEthernet0/1 

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)  
      0 packets, 0 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name VOICE-RTP
        0 packets, 0 bytes
        30 second rate 0000 bps
      QoS Set
        dscp ef
          Packets marked 0

    Class-map: class-default (match-any)  
      155000 packets, 31000000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any `,q:{en:`Why does VOICE show 0 packets?`,hi:`VOICE 0 packets kyun dikhati hai?`},o:[{en:`The policy is attached in the wrong direction`,hi:`Policy galat direction mein attach hai`},{en:`The WAN interface is congested`,hi:`WAN interface congested hai`},{en:`The ACL permits UDP ports 30000 to 32767, but the phones use 20000, so the flow falls into class-default`,hi:`ACL UDP ports 30000 se 32767 permit karti hai, lekin phones 20000 use karte hain, isliye flow class-default mein girta hai`},{en:`The deny at the end of the ACL blocks voice`,hi:`ACL ke ant ka deny voice ko block karta hai`}],a:2,w:{en:`The header says "input", so direction is right. The class-default counter is full while VOICE is empty: the match fails. The ACL range 30000 to 32767 excludes the real RTP port 20000. Correct the range (for example 16384 to 32767). An ACL in a class-map never blocks traffic, and congestion on the WAN does not affect the LAN classification.`,hi:`Header "input" kehta hai, isliye direction sahi hai. class-default counter full hai jabki VOICE khali: match fail ho raha hai. ACL range 30000 se 32767 asli RTP port 20000 ko bahar rakhti hai. Range theek karo (jaise 16384 se 32767). Class-map mein ACL kabhi traffic block nahi karti, aur WAN congestion LAN classification par asar nahi daalti.`}},{title:{en:`The mark that was scrubbed`,hi:`Woh mark jo saaf kar diya gaya`},ticket:{en:`The phone itself marks voice DSCP 46. After a new "security" policy on the LAN port, the WAN EF queue sees nothing and the call loses packets under load.`,hi:`Phone khud voice ko DSCP 46 mark karta hai. LAN port par nayi "security" policy ke baad WAN EF queue kuch nahi dekhti aur load mein call packets khoti hai.`},out:`R1# show policy-map interface GigabitEthernet0/1 input
 GigabitEthernet0/1 

  Service-policy input: MARK-IN

    Class-map: class-default (match-any)  
      155000 packets, 31000000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 
      QoS Set
        dscp default
          Packets marked 155000

R1# show policy-map interface GigabitEthernet0/0 output
 GigabitEthernet0/0 

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)  
      0 packets, 0 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: dscp ef (46)
        0 packets, 0 bytes
        30 second rate 0000 bps

PHONE> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  46    400      20/20 5000      4664       6.7%`,q:{en:`What is happening?`,hi:`Kya ho raha hai?`},o:[{en:`MARK-IN only has class-default with set dscp default, so it rewrites the phone's EF to 0 before the WAN policy sees it`,hi:`MARK-IN mein sirf class-default hai jo set dscp default karti hai, isliye WAN policy dekhne se pehle phone ka EF 0 ho jaata hai`},{en:`The WAN priority queue is too small`,hi:`WAN priority queue bahut chhoti hai`},{en:`The phone does not support DSCP`,hi:`Phone DSCP support nahi karta`},{en:`The WAN policy should be attached as input`,hi:`WAN policy input ki tarah attach honi chahiye`}],a:0,w:{en:`The traffic table shows DSCP 46 leaving the phone, but all 155,000 packets matched class-default and were set to default, so EF-Q on the WAN has 0 packets. Add a VOICE class before class-default (or trust DSCP from the phone) so the mark is kept. A too-small priority queue would show exceed drops, not zero packets, and queuing cannot be an input policy.`,hi:`Traffic table DSCP 46 phone se nikalta dikhati hai, lekin saare 155,000 packets class-default se match hue aur default set ho gaye, isliye WAN par EF-Q mein 0 packets. class-default se pehle VOICE class jodo (ya phone ka DSCP trust karo) taaki mark bacha rahe. Bahut chhoti priority queue exceed drops dikhati, zero packets nahi, aur queuing input policy nahi ho sakti.`}},{title:{en:`Voice dropping inside the priority queue`,hi:`Priority queue ke andar voice drop ho rahi hai`},ticket:{en:`A softphone farm sends 900 kbps of EF voice. The WAN is congested by a bulk flow and users report cut-outs. R1 has "priority 500" for EF.`,hi:`Ek softphone farm 900 kbps EF voice bhejta hai. WAN ek bulk flow se congested hai aur users cut-outs report karte hain. R1 par EF ke liye "priority 500" hai.`},out:`R1# show policy-map interface GigabitEthernet0/0 output | include Class-map|Priority|packets|drops
    Class-map: EF-Q (match-any)  
      11260 packets, 2252000 bytes
        11260 packets, 2252000 bytes
      Priority: 500 kbps, burst bytes 12500, b/w exceed drops: 1757
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/1757/0
    Class-map: class-default (match-any)  
      150000 packets, 30000000 bytes
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/27817/0
      Fair-queue: per-flow queue limit 16 packets`,q:{en:`What does "b/w exceed drops: 1757" tell you?`,hi:`"b/w exceed drops: 1757" aapko kya batata hai?`},o:[{en:`The EF queue ran out of buffer memory`,hi:`EF queue ka buffer memory khatam ho gaya`},{en:`The WAN link flapped`,hi:`WAN link flap hua`},{en:`The bulk traffic is being dropped`,hi:`Bulk traffic drop ho raha hai`},{en:`The voice offered more than the 500 kbps priority rate while congested, and the policed excess was dropped`,hi:`Congestion mein voice ne 500 kbps priority rate se zyada offer kiya, aur police hua excess drop hua`}],a:3,w:{en:`The priority queue is policed to its rate during congestion. 900 kbps was offered against 500 kbps, so 1,757 packets were discarded as bandwidth-exceed drops; queue depth is 0 and no-buffer drops are 0, so memory is not the issue. The bulk drops (27,817) are in class-default and are expected. The fix is a priority rate sized for the real calls, or fewer calls, not removing the guard.`,hi:`Priority queue congestion mein apne rate par police hoti hai. 500 kbps ke saamne 900 kbps offer hua, isliye 1,757 packets bandwidth-exceed drops ke roop mein discard hue; queue depth 0 aur no-buffer drops 0, yaani memory issue nahi. Bulk drops (27,817) class-default mein hain aur expected hain. Fix asli calls ke hisaab se size kiya priority rate hai, ya kam calls, guard hatana nahi.`}},{title:{en:`The policy that will not attach`,hi:`Woh policy jo attach nahi hoti`},ticket:{en:`A junior engineer on the 10 Mbps WAN configured priority 9000 for EF and bandwidth 2000 for AF11 "to be safe", then tried to attach the policy.`,hi:`10 Mbps WAN par ek junior engineer ne "safe rehne ke liye" EF ke liye priority 9000 aur AF11 ke liye bandwidth 2000 configure kiya, phir policy attach karne ki koshish ki.`},out:`R1(config)# interface GigabitEthernet0/0
R1(config-if)# service-policy output BAD
I/f GigabitEthernet0/0 class AF11-Q requested bandwidth 2000 (kbps), available only 1000 (kbps)
% Service policy BAD not attached`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Attach the policy in the input direction`,hi:`Policy ko input direction mein attach karo`},{en:`Reduce the reservations to realistic values (priority sized from the call count) so the total fits the interface`,hi:`Reservations ko realistic values tak kam karo (priority calls ki ginti se size) taaki jod interface mein fit ho`},{en:`Add random-detect to AF11-Q`,hi:`AF11-Q mein random-detect jodo`},{en:`Change the class-maps to match-all`,hi:`Class-maps ko match-all karo`}],a:1,w:{en:`Priority 9000 uses 9 Mbps of a 10 Mbps interface, leaving 1000 kbps, so the 2000 kbps bandwidth class cannot be admitted and the whole policy is rejected. A voice priority queue should be sized from real calls (and stay near a third of the link). Real IOS also holds back part of the bandwidth by default. Direction, WRED and match type are unrelated to the message.`,hi:`Priority 9000, 10 Mbps interface ke 9 Mbps leti hai, 1000 kbps bachta hai, isliye 2000 kbps bandwidth class admit nahi hoti aur poori policy reject hoti hai. Voice priority queue asli calls se size honi chahiye (aur link ke ek tihai ke aaspaas). Real IOS default mein bandwidth ka kuch hissa rok bhi leta hai. Direction, WRED aur match type is message se unrelated hain.`}},{title:{en:`Queuing in an input policy`,hi:`Input policy mein queuing`},ticket:{en:`An engineer tried to apply the WAN queuing policy (priority and bandwidth classes) as service-policy input on the LAN port, hoping to protect voice earlier.`,hi:`Ek engineer ne WAN queuing policy (priority aur bandwidth classes) ko LAN port par service-policy input ki tarah lagane ki koshish ki, taaki voice ko pehle hi bacha sake.`},out:`R1(config)# interface GigabitEthernet0/1
R1(config-if)# service-policy input OK
Queueing actions (priority, bandwidth, shape, fair-queue) are allowed only in the output direction
% Service policy OK not attached to GigabitEthernet0/1 input`,q:{en:`What is the right design?`,hi:`Sahi design kya hai?`},o:[{en:`Replace priority with police in the input policy and keep queuing there`,hi:`Input policy mein priority ko police se badlo aur queuing wahin rakho`},{en:`Use shape average on the LAN input instead`,hi:`Uski jagah LAN input par shape average use karo`},{en:`Keep an input policy for classifying, marking and policing, and attach the queuing policy as output on the congested WAN port`,hi:`Input policy classifying, marking aur policing ke liye rakho, aur queuing policy ko congested WAN port par output mein attach karo`},{en:`Disable the LAN interface QoS and rely on defaults`,hi:`LAN interface QoS band karo aur defaults par bharosa karo`}],a:2,w:{en:`Queues form where packets wait to leave, which is the output side of the congested interface, so priority, bandwidth, fair-queue and shape are output-only. Input policies do classification, marking and policing. The shape on input is also refused, and disabling QoS removes the protection entirely.`,hi:`Queues wahan banti hain jahan packets nikalne ke liye wait karte hain, yaani congested interface ke output side par, isliye priority, bandwidth, fair-queue aur shape output-only hain. Input policies classification, marking aur policing karti hain. Input par shape bhi refuse hoti hai, aur QoS band karne se protection hi khatam ho jaati hai.`}},{title:{en:`Half the backup is being dropped`,hi:`Aadha backup drop ho raha hai`},ticket:{en:`The SMB backup team says "half our packets disappear, the link must be faulty". The branch policy polices the BULK class to 3 Mbps; the server offers 6 Mbps of SMB. You read the LAN input counters.`,hi:`SMB backup team kehti hai "humare aadhe packets gayab ho jaate hain, link kharab hoga". Branch policy BULK class ko 3 Mbps par police karti hai; server 6 Mbps SMB offer karta hai. Aap LAN input counters padhte ho.`},out:`R1# show policy-map interface GigabitEthernet0/1 input
    Class-map: BULK (match-any)  
      16080 packets, 22512000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name BULK-SMB
        16080 packets, 22512000 bytes
        30 second rate 0000 bps
      police:
          cir 3000000 bps, bc 93750 bytes
        conformed 8107 packets, 11343750 bytes; actions:
          transmit 
        exceeded 7973 packets, 11168250 bytes; actions:
          drop 
        conformed 0000 bps, exceeded 0000 bps
      QoS Set
        dscp af11
          Packets marked 16080`,q:{en:`What is the correct reading?`,hi:`Sahi reading kya hai?`},o:[{en:`The policer is working as designed: about 6 Mbps arrives, 3 Mbps conforms and the exceeded half is dropped. Raise the CIR or shape the source if the business needs more`,hi:`Policer design ke hisaab se kaam kar raha hai: lagbhag 6 Mbps aata hai, 3 Mbps conform karta hai aur exceed hua aadha drop hota hai. Business ko zyada chahiye to CIR badhao ya source ko shape karo`},{en:`The cable is faulty and causing CRC errors`,hi:`Cable kharab hai aur CRC errors de raha hai`},{en:`The WAN priority queue is stealing bandwidth`,hi:`WAN priority queue bandwidth chura rahi hai`},{en:`The packets were dropped by tail drop in the output queue`,hi:`Packets output queue mein tail drop se drop hue`}],a:0,w:{en:`The police block shows 8,107 conformed and 7,973 exceeded with an exceed action of drop: an offered 6 Mbps against a 3 Mbps CIR. This is a policing result on input, not a physical fault or a queue drop. A source-side shaper or a larger CIR would reduce the loss; TCP will also slow itself.`,hi:`Police block 8,107 conformed aur 7,973 exceeded dikhata hai jiska exceed action drop hai: 3 Mbps CIR ke saamne 6 Mbps offered. Yeh input par policing ka result hai, physical fault ya queue drop nahi. Source-side shaper ya bada CIR loss kam karega; TCP bhi khud dheema hoga.`}},{title:{en:`The shaper that still drops`,hi:`Shaper jo phir bhi drop karta hai`},ticket:{en:`The WAN is shaped to 2 Mbps with a child LLQ. A backup sending 4 Mbps of TCP for 20 seconds still reports 54% loss, while the 400 kbps call is perfect. A colleague says "shapers never drop".`,hi:`WAN 2 Mbps par shape hai aur child LLQ hai. 20 second tak 4 Mbps TCP bhejne wala backup phir bhi 54% loss report karta hai, jabki 400 kbps call perfect hai. Ek colleague kehta hai "shapers kabhi drop nahi karte".`},out:`PC-DATA> traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        tcp/445    0     4000     20/20 7140      3256       54.4%

R1# show policy-map interface GigabitEthernet0/0 output
  Service-policy output: PARENT

    Class-map: class-default (match-any)  
      12140 packets, 10996000 bytes
      Queueing
      queue limit 64 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 8256/5550000
      shape (average) cir 2000000, bc 8000, be 8000
      target shape rate 2000000

      Service-policy : CH

        Class-map: EF-Q (match-any)  
          5000 packets, 1000000 bytes
          Priority: 500 kbps, burst bytes 12500, b/w exceed drops: 0

        Class-map: class-default (match-any)  
          7140 packets, 9996000 bytes
          (queue depth/total drops/no-buffer drops) 0/3884/0`,q:{en:`Which statement is correct?`,hi:`Kaunsa statement sahi hai?`},o:[{en:`The shaper is faulty; a shaper should never lose packets`,hi:`Shaper kharab hai; shaper ko kabhi packets nahi khone chahiye`},{en:`The voice class lost packets, which is why the call is bad`,hi:`Voice class ne packets khoye, isliye call kharab hai`},{en:`The shaper should be replaced by a policer to avoid drops`,hi:`Drops se bachne ke liye shaper ko policer se badal dena chahiye`},{en:`A shaper buffers bursts, but 4 Mbps offered into a 2 Mbps shaper for 20 s overflows its queue, so the child class-default drops 3,884 packets`,hi:`Shaper bursts ko buffer karta hai, lekin 20 s tak 2 Mbps shaper mein 4 Mbps offer karne par uski queue overflow hoti hai, isliye child class-default 3,884 packets drop karti hai`}],a:3,w:{en:`Shaping converts excess into delay only while buffer space remains. The sustained 4 Mbps exceeds the 2 Mbps shaped rate for the whole test, so the 64-packet queue fills and tail drop discards the surplus: 3,884 drops in class-default. EF-Q lost nothing (5,000 of 5,000). A policer would drop the excess immediately and not fix it; the cure is to lower the source rate, raise the contract, or accept TCP backing off.`,hi:`Shaping excess ko tabhi delay mein badalti hai jab tak buffer jagah bachi ho. Poore test mein sustained 4 Mbps, 2 Mbps shaped rate se upar raha, isliye 64-packet queue bhar gayi aur tail drop ne surplus discard kiya: class-default mein 3,884 drops. EF-Q ne kuch nahi khoya (5,000 mein se 5,000). Policer excess ko turant drop karta aur fix nahi hota; ilaaj hai source rate kam karna, contract badhana, ya TCP ko peeche hatne dena.`}}];export{e as default};