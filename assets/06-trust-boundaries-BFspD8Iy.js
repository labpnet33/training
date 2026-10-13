var e={id:`trust-boundaries`,h:{en:`Trust boundaries: who do you believe, and where do you re-mark`,hi:`Trust boundaries: kispar bharosa karo, aur re-mark kahan karo`},body:{en:`
<p>Every device on the network can write any DSCP it likes. A phone writes EF because its firmware says so. A PC can write EF too, if a user or a program wants its traffic to jump the queue. If the network believes every marking, the markings mean nothing and the priority queue fills with whoever is cleverest. The <b>trust boundary</b> is the place where the network stops believing what it is told and starts writing its own markings. This chapter shows how to place it, how to build it on a switch and a router, and how to translate between Layer 2 and Layer 3 where the two worlds meet.</p>

<h3>Three questions, one design</h3>
<ol>
<li><b>Who sends the marking?</b> A device we manage (phone, access point, server) or a device we do not (user PC, guest laptop).</li>
<li><b>Do we believe it?</b> Trusted devices keep their marking. Untrusted devices are re-marked, normally to 0.</li>
<li><b>Where is the boundary?</b> As close to the device as possible: the access switch port, or if the switch cannot do it, the first router interface.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Trust boundary">
<rect x="20" y="20" width="100" height="40" rx="8" fill="#fde68a"/><text x="70" y="45" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text>
<rect x="20" y="90" width="100" height="40" rx="8" fill="#fecaca"/><text x="70" y="115" text-anchor="middle" class="svg-ink" font-size="13">User PC</text>
<rect x="190" y="50" width="120" height="70" rx="10" fill="#bae6fd"/><text x="250" y="80" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="250" y="100" text-anchor="middle" class="svg-muted" font-size="11">trust per port</text>
<rect x="380" y="50" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="440" y="80" text-anchor="middle" class="svg-ink" font-size="13">Router R1</text><text x="440" y="100" text-anchor="middle" class="svg-muted" font-size="11">re-mark by VLAN</text>
<rect x="550" y="50" width="80" height="70" rx="10" fill="#bbf7d0"/><text x="590" y="90" text-anchor="middle" class="svg-ink" font-size="13">WAN</text>
<line x1="120" y1="40" x2="190" y2="75" stroke="#64748b" stroke-width="2"/><line x1="120" y1="110" x2="190" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="85" x2="380" y2="85" stroke="#64748b" stroke-width="2"/><line x1="500" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="165" y1="10" x2="165" y2="150" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 4"/><text x="165" y="170" text-anchor="middle" class="svg-accent" font-size="12">trust boundary</text>
<text x="70" y="195" text-anchor="middle" class="svg-muted" font-size="11">untrusted side</text><text x="400" y="195" text-anchor="middle" class="svg-muted" font-size="11">trusted side: markings are ours</text>
</svg><p class="cap">The dashed line is the boundary. Anything that crosses it must carry a marking we wrote or approved.</p></div>

<h3>Conditional trust for phones</h3>
<p>A phone has a PC plugged into its back port, so one switch port carries a trusted device and an untrusted one. The usual solution is <b>conditional trust</b>: the switch trusts the port only while it detects a real phone. On older Catalyst switches the command is <code>mls qos trust device cisco-phone</code> together with <code>mls qos trust cos</code>. Voice and data are also kept in different VLANs, so the router can tell them apart later by subinterface.</p>

<h3>Step 1: the access switch</h3>
<p>The first lab sets trust per port on SW1, using the classic <code>mls qos</code> commands. Once <code>mls qos</code> is on, <b>a port that is not told to trust resets the marking to zero</b>. A trusted port keeps it.</p>
<pre class="code">mls qos
<span class="c">!</span>
interface FastEthernet0/1
 description IP phone
 mls qos trust cos
interface FastEthernet0/2
 description User PC
 no mls qos trust
interface GigabitEthernet0/0
 description Uplink to R1
 mls qos trust dscp</pre>
<pre class="out">SW1#show mls qos interface FastEthernet0/1
FastEthernet0/1
trust state: <span class="hl">trust cos</span>
trust mode: trust cos
trust enabled flag: ena
COS override: dis
default COS: 0
DSCP Mutation Map: Default DSCP Mutation Map
Trust device: none
qos mode: port-based

SW1#show mls qos interface FastEthernet0/2
FastEthernet0/2
trust state: <span class="hl">not trusted</span>
trust mode: not trusted
trust enabled flag: dis</pre>
<p>The phone port trusts CoS, the PC port trusts nothing, and the uplink trusts DSCP because the switch ends up carrying already-marked traffic toward the router. <i>Platform note:</i> <code>mls qos</code> belongs to the older Catalyst 2960, 3560 and 3750 families. Catalyst 9000 switches run QoS permanently, trust DSCP by default and are changed with MQC policies. The practice simulator accepts, stores and shows the legacy trust commands but does not rewrite the DSCP inside the switch, so the router policy below provides the enforcement you can measure.</p>

<h3>Step 2: re-mark at the router</h3>
<p>The router R1 has one subinterface per VLAN. The data VLAN carries user PCs, so everything from it is reset to DSCP 0. The voice VLAN carries phones, so the policy lists the markings a phone may use (EF for voice, CS3 for signalling) and resets anything else.</p>
<pre class="code">policy-map DATA-IN
 class class-default
  set dscp default
interface GigabitEthernet0/1.10
 description Data VLAN 10
 service-policy input DATA-IN
<span class="c">!</span>
class-map match-any PH-VOICE
 match dscp ef
class-map match-any PH-SIG
 match dscp cs3
policy-map PHONE-IN
 class PH-VOICE
 class PH-SIG
 class class-default
  set dscp default
interface GigabitEthernet0/1.20
 description Voice VLAN 20
 service-policy input PHONE-IN</pre>
<p>Look at PHONE-IN. The first two classes have <b>no set action</b>: matching packets pass with their DSCP intact. That is how "trust only EF and CS3" is written. A phone that sends AF41 by mistake, or an infected device pretending to be a phone, falls into class-default and is reset.</p>
<table class="cmp"><tr><th>Source</th><th>Arrives as</th><th>Leaves R1 as</th></tr>
<tr><td>User PC (VLAN 10)</td><td>EF (46)</td><td>Default (0)</td></tr>
<tr><td>IP phone (VLAN 20)</td><td>EF (46)</td><td>EF (46), kept</td></tr>
<tr><td>IP phone (VLAN 20)</td><td>CS3 (24)</td><td>CS3 (24), kept</td></tr>
<tr><td>Rogue device (VLAN 20)</td><td>AF41 (34)</td><td>Default (0)</td></tr>
</table>

<h3>Proving it under load</h3>
<p>The attack: the phone sends a 400 kbps call marked EF and the PC sends a 12 Mbps copy job, also marked EF, over a 10 Mbps WAN whose output policy gives EF a 1 Mbps priority queue. Without the boundary the 12 Mbps flow would flood that queue. With it:</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/1.10 input
    Class-map: class-default (match-any)
      Match: any
      QoS Set
        dscp default
          <span class="hl">Packets marked 112500</span>

R1#show policy-map interface GigabitEthernet0/0 output
    Class-map: EF-Q (match-any)
      Match: dscp ef (46)
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      (queue depth/total drops/no-buffer drops) <span class="hl">0/0/0</span>
      (pkts output/bytes output) 3750/750000
    Class-map: class-default (match-any)
      (queue depth/total drops/no-buffer drops) <span class="hl">0/19750/0</span>
      (pkts output/bytes output) 92750/18550000</pre>
<p>The PC's 112 500 packets were all re-marked to 0 and lost 17.6 percent in class-default, while the phone's 3750 packets crossed the EF queue with no loss. The attack now only hurts the attacker.</p>

<h3>Translating CoS to DSCP at the Layer 2 / Layer 3 border</h3>
<p>Remember from chapter 3 that CoS dies at the first router. Where a Layer 2 access device marks CoS and the router has to continue in Layer 3, you translate on the way in and, for return traffic, translate back on the way out. The third lab (Sahyadri University, lecture hall access device ACC1 and distribution router R1) does it with two policies on the link between them:</p>
<pre class="code">class-map match-any COS5
 match cos 5
class-map match-any COS3
 match cos 3
class-map match-any COS1
 match cos 1
policy-map COS-TO-DSCP
 class COS5
  set dscp ef
 class COS3
  set dscp cs3
 class COS1
  set dscp cs1
<span class="c">!</span>
class-map match-any DSCP-EF
 match dscp ef
class-map match-any DSCP-CS3
 match dscp cs3
class-map match-any DSCP-CS1
 match dscp cs1
policy-map DSCP-TO-COS
 class DSCP-EF
  set cos 5
 class DSCP-CS3
  set cos 3
 class DSCP-CS1
  set cos 1
<span class="c">!</span>
interface GigabitEthernet0/0
 service-policy input COS-TO-DSCP
 service-policy output DSCP-TO-COS</pre>
<pre class="out">R1#show policy-map interface GigabitEthernet0/0 input
  Service-policy input: COS-TO-DSCP
    Class-map: COS5 (match-any)
      Match: cos 5
      QoS Set
        dscp ef
          <span class="hl">Packets marked 504</span>

R1#show policy-map interface GigabitEthernet0/0 output
  Service-policy output: DSCP-TO-COS
    Class-map: DSCP-EF (match-any)
      Match: dscp ef (46)
      QoS Set
        cos 5
          <span class="hl">Packets marked 504</span></pre>
<p>This explicit pair also avoids the default-map trap: CoS 5 becomes EF (46) because <i>we</i> say so, not 40. Note the pairing rule: if you translate in you must translate out, otherwise return traffic reaches the access layer with CoS 0.</p>

<div class="warn"><p><b>Common mistake.</b> Trusting the whole network "because it is our PCs". One misconfigured laptop or one gaming program marking EF is enough to fill the priority queue. Also common: building the inbound CoS-to-DSCP map and forgetting the outbound DSCP-to-CoS one.</p></div>
<div class="exam"><p><b>Exam trap.</b> The boundary sits at the first device you control, not at the WAN. With <code>mls qos</code> enabled, untrusted ports reset to 0, while with it disabled the switch passes markings untouched. A class with no set action is a trust statement.</p></div>

<div class="scn"><h4>The copy job that stole the priority queue</h4><p>In Pune a user's file sync ran at 12 Mbps and calls broke up. Everything looked fine in the WAN policy. The cause: the sync client set DSCP EF on its traffic, the router trusted all markings, and the EF queue (1 Mbps) was swamped. The engineer set the switch ports to untrusted except the phone and uplink, added DATA-IN on the data subinterface and PHONE-IN on the voice subinterface. The next test showed call loss 0.0 percent and the sync losing packets in class-default.</p><p><b>Lesson:</b> build the boundary before you build the priority queue. A priority queue without a trust boundary is an open door.</p></div>
<div class="iv"><p class="q">"What is a trust boundary and where do you put it?"</p><p>It is where the network stops believing the markings it receives and applies its own. Put it as close to the source as possible: on the access switch port, with conditional trust for phones, and re-mark untrusted traffic to 0 on the first router if the switch cannot. Mention separate voice and data VLANs and that a class with no set action expresses trust.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The trust boundary is where you stop believing received markings; place it at the first device you control.</li>
<li>Phones get conditional trust; user PCs are untrusted and re-marked to 0.</li>
<li>On legacy Catalyst, <code>mls qos</code> plus per-port trust decides; untrusted ports reset to 0.</li>
<li>At the router, a class with no set action keeps the marking; class-default set dscp default resets the rest.</li>
<li>At the L2 / L3 border translate CoS to DSCP going in and DSCP to CoS going out, with an explicit map.</li>
</ul></div>
`,hi:`
<p>Network ka har device koi bhi DSCP likh sakta hai. Phone EF likhta hai kyunki uska firmware aisa kehta hai. PC bhi EF likh sakta hai agar koi user ya program chahta hai ki uska traffic queue mein aage nikal jaaye. Agar network har marking par bharosa kare, to markings ka koi matlab nahi rehta aur priority queue us se bhar jaati hai jo sabse chalaak ho. <b>Trust boundary</b> woh jagah hai jahan network jo bataya jaata hai us par bharosa karna band kar deta hai aur apni markings likhna shuru karta hai. Yeh chapter dikhata hai ki use kahan rakhna hai, switch aur router par kaise banana hai, aur Layer 2 aur Layer 3 jahan milte hain wahan translate kaise karna hai.</p>

<h3>Teen sawal, ek design</h3>
<ol>
<li><b>Marking kaun bhejta hai?</b> Hamara manage kiya hua device (phone, access point, server) ya woh jo hum manage nahi karte (user PC, guest laptop).</li>
<li><b>Kya hum us par bharosa karte hain?</b> Trusted devices apni marking rakhte hain. Untrusted devices re-mark hote hain, aam taur par 0 par.</li>
<li><b>Boundary kahan hai?</b> Device ke jitna paas ho sake: access switch port, ya agar switch na kar sake to pehla router interface.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Trust boundary">
<rect x="20" y="20" width="100" height="40" rx="8" fill="#fde68a"/><text x="70" y="45" text-anchor="middle" class="svg-ink" font-size="13">IP phone</text>
<rect x="20" y="90" width="100" height="40" rx="8" fill="#fecaca"/><text x="70" y="115" text-anchor="middle" class="svg-ink" font-size="13">User PC</text>
<rect x="190" y="50" width="120" height="70" rx="10" fill="#bae6fd"/><text x="250" y="80" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="250" y="100" text-anchor="middle" class="svg-muted" font-size="11">trust per port</text>
<rect x="380" y="50" width="120" height="70" rx="10" fill="#ddd6fe"/><text x="440" y="80" text-anchor="middle" class="svg-ink" font-size="13">Router R1</text><text x="440" y="100" text-anchor="middle" class="svg-muted" font-size="11">re-mark by VLAN</text>
<rect x="550" y="50" width="80" height="70" rx="10" fill="#bbf7d0"/><text x="590" y="90" text-anchor="middle" class="svg-ink" font-size="13">WAN</text>
<line x1="120" y1="40" x2="190" y2="75" stroke="#64748b" stroke-width="2"/><line x1="120" y1="110" x2="190" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="85" x2="380" y2="85" stroke="#64748b" stroke-width="2"/><line x1="500" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="165" y1="10" x2="165" y2="150" stroke="#dc2626" stroke-width="2" stroke-dasharray="6 4"/><text x="165" y="170" text-anchor="middle" class="svg-accent" font-size="12">trust boundary</text>
<text x="70" y="195" text-anchor="middle" class="svg-muted" font-size="11">untrusted side</text><text x="400" y="195" text-anchor="middle" class="svg-muted" font-size="11">trusted side: markings are ours</text>
</svg><p class="cap">Dashed line boundary hai. Jo bhi isse paar kare use aisi marking leke chalna hoga jo humne likhi ya approve ki.</p></div>

<h3>Phones ke liye conditional trust</h3>
<p>Phone ke peeche ke port mein PC lagta hai, isliye ek switch port par ek trusted aur ek untrusted device hota hai. Usual solution <b>conditional trust</b> hai: switch port ko tabhi trust karta hai jab use asli phone detect ho. Purane Catalyst switches par command <code>mls qos trust device cisco-phone</code> hai, <code>mls qos trust cos</code> ke saath. Voice aur data ko alag VLANs mein bhi rakhte hain, taaki router baad mein subinterface se dono ko alag pehchaan sake.</p>

<h3>Step 1: access switch</h3>
<p>Pehla lab SW1 par classic <code>mls qos</code> commands se har port ka trust set karta hai. <code>mls qos</code> on hone ke baad <b>jis port ko trust karne ko nahi kaha gaya woh marking ko zero par reset kar deta hai</b>. Trusted port use rakhta hai.</p>
<pre class="code">mls qos
<span class="c">!</span>
interface FastEthernet0/1
 description IP phone
 mls qos trust cos
interface FastEthernet0/2
 description User PC
 no mls qos trust
interface GigabitEthernet0/0
 description Uplink to R1
 mls qos trust dscp</pre>
<pre class="out">SW1#show mls qos interface FastEthernet0/1
FastEthernet0/1
trust state: <span class="hl">trust cos</span>
trust mode: trust cos
trust enabled flag: ena
COS override: dis
default COS: 0
DSCP Mutation Map: Default DSCP Mutation Map
Trust device: none
qos mode: port-based

SW1#show mls qos interface FastEthernet0/2
FastEthernet0/2
trust state: <span class="hl">not trusted</span>
trust mode: not trusted
trust enabled flag: dis</pre>
<p>Phone port CoS trust karta hai, PC port kuch trust nahi karta, aur uplink DSCP trust karta hai kyunki switch router ki taraf pehle se marked traffic le jaata hai. <i>Platform note:</i> <code>mls qos</code> purane Catalyst 2960, 3560 aur 3750 families ka hai. Catalyst 9000 switches par QoS hamesha chalu rehti hai, default se DSCP trust karti hai aur MQC policies se badli jaati hai. Practice simulator legacy trust commands accept karta hai, store karta hai aur dikhata hai, lekin switch ke andar DSCP rewrite nahi karta, isliye neeche ki router policy woh enforcement deti hai jise aap measure kar sakte ho.</p>

<h3>Step 2: router par re-mark</h3>
<p>Router R1 ke paas har VLAN ke liye ek subinterface hai. Data VLAN user PCs ko le jaata hai, isliye usse aane wali har cheez DSCP 0 par reset hoti hai. Voice VLAN phones ko le jaata hai, isliye policy un markings ki list rakhti hai jo phone use kar sakta hai (voice ke liye EF, signalling ke liye CS3) aur baaki sab reset karti hai.</p>
<pre class="code">policy-map DATA-IN
 class class-default
  set dscp default
interface GigabitEthernet0/1.10
 description Data VLAN 10
 service-policy input DATA-IN
<span class="c">!</span>
class-map match-any PH-VOICE
 match dscp ef
class-map match-any PH-SIG
 match dscp cs3
policy-map PHONE-IN
 class PH-VOICE
 class PH-SIG
 class class-default
  set dscp default
interface GigabitEthernet0/1.20
 description Voice VLAN 20
 service-policy input PHONE-IN</pre>
<p>PHONE-IN dekho. Pehli do classes mein <b>koi set action nahi</b>: matching packets apne DSCP ke saath guzarte hain. "Sirf EF aur CS3 par trust karo" aise likha jaata hai. Jo phone galti se AF41 bheje, ya phone ka dikhawa karne wala infected device, woh class-default mein girta hai aur reset hota hai.</p>
<table class="cmp"><tr><th>Source</th><th>Arrives as</th><th>Leaves R1 as</th></tr>
<tr><td>User PC (VLAN 10)</td><td>EF (46)</td><td>Default (0)</td></tr>
<tr><td>IP phone (VLAN 20)</td><td>EF (46)</td><td>EF (46), kept</td></tr>
<tr><td>IP phone (VLAN 20)</td><td>CS3 (24)</td><td>CS3 (24), kept</td></tr>
<tr><td>Rogue device (VLAN 20)</td><td>AF41 (34)</td><td>Default (0)</td></tr>
</table>

<h3>Load ke neeche sabit karna</h3>
<p>Attack: phone EF mark ki 400 kbps call bhejta hai aur PC 12 Mbps copy job bhejta hai, woh bhi EF mark ka, 10 Mbps WAN par jiski output policy EF ko 1 Mbps priority queue deti hai. Boundary ke bina 12 Mbps flow us queue ko bhar deta. Boundary ke saath:</p>
<pre class="out">R1#show policy-map interface GigabitEthernet0/1.10 input
    Class-map: class-default (match-any)
      Match: any
      QoS Set
        dscp default
          <span class="hl">Packets marked 112500</span>

R1#show policy-map interface GigabitEthernet0/0 output
    Class-map: EF-Q (match-any)
      Match: dscp ef (46)
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      (queue depth/total drops/no-buffer drops) <span class="hl">0/0/0</span>
      (pkts output/bytes output) 3750/750000
    Class-map: class-default (match-any)
      (queue depth/total drops/no-buffer drops) <span class="hl">0/19750/0</span>
      (pkts output/bytes output) 92750/18550000</pre>
<p>PC ke 112 500 packets sab 0 par re-mark hue aur class-default mein 17.6 percent kho gaye, jabki phone ke 3750 packets EF queue se bina loss ke guzre. Ab attack sirf attacker ko hurt karta hai.</p>

<h3>Layer 2 / Layer 3 border par CoS ko DSCP mein translate karna</h3>
<p>Chapter 3 se yaad karo ki CoS pehle router par mar jaata hai. Jahan Layer 2 access device CoS mark karta hai aur router ko Layer 3 mein aage chalna hai, wahan andar aate waqt translate karte ho aur return traffic ke liye bahar jaate waqt wapas translate karte ho. Teesra lab (Sahyadri University, lecture hall access device ACC1 aur distribution router R1) un dono ke beech ke link par do policies se yeh karta hai:</p>
<pre class="code">class-map match-any COS5
 match cos 5
class-map match-any COS3
 match cos 3
class-map match-any COS1
 match cos 1
policy-map COS-TO-DSCP
 class COS5
  set dscp ef
 class COS3
  set dscp cs3
 class COS1
  set dscp cs1
<span class="c">!</span>
class-map match-any DSCP-EF
 match dscp ef
class-map match-any DSCP-CS3
 match dscp cs3
class-map match-any DSCP-CS1
 match dscp cs1
policy-map DSCP-TO-COS
 class DSCP-EF
  set cos 5
 class DSCP-CS3
  set cos 3
 class DSCP-CS1
  set cos 1
<span class="c">!</span>
interface GigabitEthernet0/0
 service-policy input COS-TO-DSCP
 service-policy output DSCP-TO-COS</pre>
<pre class="out">R1#show policy-map interface GigabitEthernet0/0 input
  Service-policy input: COS-TO-DSCP
    Class-map: COS5 (match-any)
      Match: cos 5
      QoS Set
        dscp ef
          <span class="hl">Packets marked 504</span>

R1#show policy-map interface GigabitEthernet0/0 output
  Service-policy output: DSCP-TO-COS
    Class-map: DSCP-EF (match-any)
      Match: dscp ef (46)
      QoS Set
        cos 5
          <span class="hl">Packets marked 504</span></pre>
<p>Yeh explicit jodi default-map trap se bhi bachati hai: CoS 5 se EF (46) isliye banta hai kyunki <i>hum</i> kehte hain, 40 nahi. Pairing rule dhyan mein rakho: andar translate karo to bahar bhi karo, warna return traffic access layer tak CoS 0 ke saath pahunchta hai.</p>

<div class="warn"><p><b>Common mistake.</b> "Humare hi PCs hain" kehkar poore network par trust karna. Ek galat configured laptop ya ek gaming program ka EF mark karna priority queue bharne ke liye kaafi hai. Aur aam galti: inbound CoS-to-DSCP map banana aur outbound DSCP-to-CoS bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Boundary us pehle device par hoti hai jo aap control karte ho, WAN par nahi. <code>mls qos</code> enabled ho to untrusted ports 0 par reset karte hain, jabki disabled ho to switch markings ko jaisa hai waisa guzarne deta hai. Bina set action ki class trust ka statement hai.</p></div>

<div class="scn"><h4>Copy job jisne priority queue chura li</h4><p>Pune mein ek user ka file sync 12 Mbps par chala aur calls toot gayi. WAN policy mein sab theek tha. Wajah: sync client apne traffic par DSCP EF set karta tha, router ne saari markings par trust kiya, aur EF queue (1 Mbps) bhar gayi. Engineer ne switch ports phone aur uplink ke alawa untrusted kiye, data subinterface par DATA-IN aur voice subinterface par PHONE-IN lagaya. Agle test mein call loss 0.0 percent aaya aur sync class-default mein packets khota raha.</p><p><b>Lesson:</b> priority queue banane se pehle boundary banao. Trust boundary ke bina priority queue khula darwaza hai.</p></div>
<div class="iv"><p class="q">"Trust boundary kya hai aur use kahan rakhte ho?"</p><p>Woh jagah jahan network mili hui markings par bharosa karna band karke apni markings lagata hai. Source ke jitna paas ho sake rakho: access switch port par, phones ke liye conditional trust ke saath, aur agar switch na kar sake to pehle router par untrusted traffic ko 0 par re-mark karo. Alag voice aur data VLANs ka zikr karo aur yeh ki bina set action ki class trust express karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trust boundary woh hai jahan aap mili hui markings par bharosa karna band karte ho; use pehle controlled device par rakho.</li>
<li>Phones ko conditional trust milta hai; user PCs untrusted hain aur 0 par re-mark hote hain.</li>
<li>Legacy Catalyst par <code>mls qos</code> aur per-port trust tay karta hai; untrusted ports 0 par reset karte hain.</li>
<li>Router par bina set action ki class marking rakhti hai; class-default set dscp default baaki sab reset karti hai.</li>
<li>L2 / L3 border par andar CoS se DSCP aur bahar DSCP se CoS translate karo, explicit map ke saath.</li>
</ul></div>
`}};export{e as default};