var e=[{title:{en:`Policy attached, every counter zero`,hi:`Policy attached, har counter zero`},ticket:{en:`At the Nagpur clinic the engineer attached MARK-IN to G0/1 to mark phone traffic arriving from the LAN. Calls are running. Read the output.`,hi:`Nagpur clinic mein engineer ne LAN se aane wale phone traffic ko mark karne ke liye G0/1 par MARK-IN lagaya. Calls chal rahe hain. Output padho.`},out:`R1#show policy-map interface GigabitEthernet0/1 output
 GigabitEthernet0/1

  Service-policy output: MARK-IN

    Class-map: VOICE (match-any)
      0 packets, 0 bytes
      Match: access-group name VOICE-RTP
      QoS Set
        dscp ef
          Packets marked 0

    Class-map: class-default (match-any)
      0 packets, 0 bytes
      Match: any`,q:{en:`What is the most likely cause?`,hi:`Sabse mumkin wajah kya hai?`},o:[{en:`The ACL VOICE-RTP is empty`,hi:`ACL VOICE-RTP khaali hai`},{en:`The class has no set action`,hi:`Class mein set action nahi hai`},{en:`The policy is attached in the output direction instead of input`,hi:`Policy input ki jagah output direction mein lagi hai`},{en:`class-default is blocking voice`,hi:`class-default voice ko block kar raha hai`}],a:2,w:{en:`Every class shows zero, including class-default, so no LAN-origin packet passes in that direction. The line reads Service-policy output. Move the attachment to input.`,hi:`Har class zero hai, class-default bhi, yaani us direction mein LAN se aane wala koi packet guzarta hi nahi. Line Service-policy output kehti hai. Attachment input par le jao.`}},{title:{en:`A web class that never matches`,hi:`Web class jo kabhi match nahi karti`},ticket:{en:`Web users at Pune report no priority, while browsing runs. The WEB class should mark AF21. Read the class definition and the counters.`,hi:`Pune ke web users ko priority nahi mil rahi, browsing chal rahi hai. WEB class ko AF21 mark karna chahiye. Class definition aur counters padho.`},out:`R1#show class-map WEB
 Class Map match-all WEB (id 3)
   Match protocol http
   Match protocol secure-http

R1#show policy-map interface GigabitEthernet0/1 input
    Class-map: WEB (match-all)
      0 packets, 0 bytes
      Match: protocol http
      Match: protocol secure-http
      QoS Set
        dscp af21
          Packets marked 0`,q:{en:`What fixes it?`,hi:`Isse kya theek karega?`},o:[{en:`Change the class-map to match-any`,hi:`Class-map ko match-any karo`},{en:`Add set cos 2`,hi:`set cos 2 jodo`},{en:`Change dscp af21 to af41`,hi:`dscp af21 ko af41 karo`},{en:`Attach the policy in output`,hi:`Policy output mein lagao`}],a:0,w:{en:`Match-all needs both lines true for the same packet, and one packet is never both http and secure-http. Match-any needs only one.`,hi:`Match-all mein ek hi packet ke liye dono lines true chahiye, aur ek packet kabhi http aur secure-http dono nahi hota. Match-any mein ek kaafi hai.`}},{title:{en:`Some calls marked, some not`,hi:`Kuch calls marked, kuch nahi`},ticket:{en:`A Jaipur contact centre has choppy calls on some extensions only. Here is the ACL and the policy counters during a test with 40 calls.`,hi:`Jaipur contact centre mein sirf kuch extensions par calls tootati hain. 40 calls ke test mein ACL aur policy counters yeh hain.`},out:`R1#show ip access-lists VOICE-RTP
Extended IP access list VOICE-RTP
 10 permit udp any any range 16384 17000

R1#show policy-map interface GigabitEthernet0/1 input
    Class-map: VOICE (match-any)
      11000 packets
      QoS Set
        dscp ef
          Packets marked 11000
    Class-map: class-default (match-any)
      27500 packets`,q:{en:`Why is part of the voice in class-default?`,hi:`Voice ka kuch hissa class-default mein kyun hai?`},o:[{en:`EF is not allowed on this interface`,hi:`Is interface par EF allowed nahi`},{en:`The set action is applied only 28 percent of the time`,hi:`Set action sirf 28 percent baar lagti hai`},{en:`The phones use TCP`,hi:`Phones TCP use karte hain`},{en:`The ACL covers only a slice of the RTP port range`,hi:`ACL RTP port range ka sirf ek hissa cover karti hai`}],a:3,w:{en:`The ACL permits UDP 16384 to 17000, while RTP can use up to 32767. Calls on ports outside the slice miss the VOICE class. Widen the range to 16384 32767.`,hi:`ACL UDP 16384 se 17000 permit karti hai, jabki RTP 32767 tak jaa sakta hai. Slice ke bahar ke ports ki calls VOICE class miss karti hain. Range 16384 32767 karo.`}},{title:{en:`The PC that marks itself EF`,hi:`Jo PC khud ko EF mark karta hai`},ticket:{en:`A 12 Mbps copy job from a PC carries DSCP EF and the phone call at the same site breaks up. The WAN policy has an EF priority queue of 1 Mbps. What is missing?`,hi:`PC se 12 Mbps ka copy job DSCP EF leke chalta hai aur usi site ki phone call toot jaati hai. WAN policy mein 1 Mbps ka EF priority queue hai. Kya missing hai?`},out:`R1#show policy-map interface GigabitEthernet0/0 output
    Class-map: EF-Q (match-any)
      Match: dscp ef (46)
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 41210
      (pkts output/bytes output) 3750/750000
    Class-map: class-default (match-any)
      (pkts output/bytes output) 4100/820000`,q:{en:`What should you add?`,hi:`Kya jodna chahiye?`},o:[{en:`A bigger priority queue of 12 Mbps`,hi:`12 Mbps ka bada priority queue`},{en:`A trust boundary that re-marks PC traffic to DSCP 0 at the edge`,hi:`Edge par trust boundary jo PC traffic ko DSCP 0 par re-mark kare`},{en:`Set cos 7 on the PC port`,hi:`PC port par set cos 7`},{en:`Another EF class for the PC`,hi:`PC ke liye doosri EF class`}],a:1,w:{en:`Exceed drops show the EF queue is flooded by a flow that should not be EF. Re-mark untrusted PC traffic to 0 at the edge. A bigger queue would let the attacker take more bandwidth.`,hi:`Exceed drops dikhate hain ki EF queue aise flow se bhar gayi jo EF hona nahi chahiye. Untrusted PC traffic ko edge par 0 par re-mark karo. Bada queue attacker ko aur bandwidth lene deta.`}},{title:{en:`Return traffic loses its CoS`,hi:`Return traffic ka CoS kho jaata hai`},ticket:{en:`At Sahyadri University the access device marks CoS 5 on lecture video. Upstream works, but streams coming back from the server arrive at the lecture hall with CoS 0. R1 has COS-TO-DSCP on input of G0/0. Read the config.`,hi:`Sahyadri University mein access device lecture video par CoS 5 mark karta hai. Upstream chalta hai, par server se wapas aane wali streams lecture hall mein CoS 0 ke saath pahunchti hain. R1 ke G0/0 input par COS-TO-DSCP hai. Config padho.`},out:`R1#show running-config interface GigabitEthernet0/0
interface GigabitEthernet0/0
 ip address 10.30.0.2 255.255.255.252
 service-policy input COS-TO-DSCP`,q:{en:`What is missing?`,hi:`Kya missing hai?`},o:[{en:`mls qos on R1`,hi:`R1 par mls qos`},{en:`A DSCP-to-CoS policy attached in output on G0/0`,hi:`G0/0 par output mein lagi DSCP-to-CoS policy`},{en:`A second COS-TO-DSCP policy in output`,hi:`Output mein doosri COS-TO-DSCP policy`},{en:`A bigger MTU`,hi:`Bada MTU`}],a:1,w:{en:`CoS exists only in the Layer 2 tag and is lost after routing. Going back down, R1 must translate DSCP to CoS with set cos in an output policy (DSCP-TO-COS).`,hi:`CoS sirf Layer 2 tag mein hota hai aur routing ke baad kho jaata hai. Wapas neeche jaate waqt R1 ko output policy (DSCP-TO-COS) mein set cos se DSCP ko CoS mein translate karna hoga.`}},{title:{en:`Phone port, wrong trust`,hi:`Phone port, galat trust`},ticket:{en:`After enabling mls qos on SW1, phone voice from Fa0/1 reaches R1 with DSCP 0. Read the port output.`,hi:`SW1 par mls qos enable karne ke baad Fa0/1 se phone voice DSCP 0 ke saath R1 tak pahunchti hai. Port ka output padho.`},out:`SW1#show mls qos interface FastEthernet0/1
FastEthernet0/1
trust state: not trusted
trust mode: not trusted
trust enabled flag: dis
COS override: dis
default COS: 0`,q:{en:`What do you configure on the port?`,hi:`Port par kya configure karoge?`},o:[{en:`mls qos trust cos on FastEthernet0/1`,hi:`FastEthernet0/1 par mls qos trust cos`},{en:`mls qos on the port`,hi:`Port par mls qos`},{en:`no mls qos`,hi:`no mls qos`},{en:`mls qos trust dscp on the PC port`,hi:`PC port par mls qos trust dscp`}],a:0,w:{en:`Once mls qos is on, a port that is not told to trust resets the marking. The phone port needs trust (here cos). The PC port stays untrusted.`,hi:`mls qos on hone ke baad jis port ko trust karne ko nahi kaha gaya woh marking reset kar deta hai. Phone port ko trust chahiye (yahan cos). PC port untrusted hi rehta hai.`}},{title:{en:`Signalling marked like voice`,hi:`Signalling voice jaisi marked`},ticket:{en:`A policy marks both RTP and SIP signalling as EF. The EF queue (1 Mbps) now drops during busy hour. What is the better design?`,hi:`Ek policy RTP aur SIP signalling dono ko EF mark karti hai. EF queue (1 Mbps) busy hour mein drop karta hai. Behtar design kya hai?`},out:`R1#show policy-map interface GigabitEthernet0/1 input
    Class-map: VOICE (match-any)
      Match: access-group name VOICE-RTP
      Match: protocol sip
      QoS Set
        dscp ef
          Packets marked 9400`,q:{en:`What do you change?`,hi:`Kya badloge?`},o:[{en:`Move voice to AF21`,hi:`Voice ko AF21 mein le jao`},{en:`Mark everything default`,hi:`Sab kuch default mark karo`},{en:`Use match-all so only RTP matches`,hi:`Match-all use karo taaki sirf RTP match ho`},{en:`Split SIP into its own class marked CS3, keep only RTP as EF`,hi:`SIP ko alag class mein CS3 mark karo, sirf RTP ko EF rakho`}],a:3,w:{en:`Signalling needs reliability, not strict low latency. Give it CS3 in its own class and keep the priority queue for media only. Match-all with two different protocols would match nothing.`,hi:`Signalling ko reliability chahiye, strict low latency nahi. Use alag class mein CS3 do aur priority queue sirf media ke liye rakho. Do alag protocols ke saath match-all kuch match nahi karta.`}},{title:{en:`Switch and router disagree`,hi:`Switch aur router mein matlab alag`},ticket:{en:`The access switch trusts CoS and the router has a policy that matches dscp ef on the voice VLAN. Phones are marked CoS 5, yet the router class shows zero packets. Read the captured packet fields.`,hi:`Access switch CoS trust karta hai aur router ki voice VLAN par policy dscp ef match karti hai. Phones CoS 5 mark karte hain, phir bhi router class zero packets dikhati hai. Captured packet fields padho.`},out:`Packet on G0/1.20 input:
  CoS 5
  DSCP 40 (cs5)

R1#show policy-map interface GigabitEthernet0/1.20 input
    Class-map: PH-VOICE (match-any)
      Match: dscp ef (46)
      0 packets`,q:{en:`What happened and what is the fix?`,hi:`Kya hua aur fix kya hai?`},o:[{en:`The default CoS 5 to DSCP map gave 40, so map CoS 5 to EF explicitly (match cos 5, set dscp ef)`,hi:`Default CoS 5 se DSCP map ne 40 diya, isliye CoS 5 ko explicit EF map karo (match cos 5, set dscp ef)`},{en:`The phone is broken, replace it`,hi:`Phone kharaab hai, badlo`},{en:`EF equals 40, change the class to dscp 40 only`,hi:`EF 40 hai, class ko sirf dscp 40 karo`},{en:`Remove the voice VLAN`,hi:`Voice VLAN hata do`}],a:0,w:{en:`CoS 5 maps to DSCP 40 by default, but EF is 46. Be explicit with a CoS-to-DSCP policy so the router sees EF.`,hi:`CoS 5 default se DSCP 40 par map hota hai, par EF 46 hai. CoS-to-DSCP policy se explicit raho taaki router EF dekhe.`}}];export{e as default};