var e={id:`verify-troubleshoot`,h:{en:`Verification and troubleshooting QoS`,hi:`QoS ki verification aur troubleshooting`},body:{en:`
<p>When a courier parcel is late, a good dispatcher does not guess. He checks the label, the sorting belt it was put on, and which van picked it up, in that order. QoS faults feel mysterious ("calls are bad but the config looks right") because the config is only one of four places a fault can hide. Troubleshooting QoS is a short, repeatable walk: is the policy attached, in the right direction, matching the right traffic, with the right marking arriving, and are the counters moving?</p>

<h3>Your verification toolkit</h3>
<div class="tbl"><table>
<tr><th>Command</th><th>Answers the question</th></tr>
<tr><td><code>show class-map [NAME]</code></td><td>What does each class match?</td></tr>
<tr><td><code>show policy-map [NAME]</code></td><td>What actions does each policy apply?</td></tr>
<tr><td><code>show policy-map interface [INTF] [input|output]</code></td><td>Is it attached, which direction, and are the counters moving? The most important command.</td></tr>
<tr><td><code>show running-config interface INTF</code></td><td>Which <code>service-policy</code> lines are really on the port?</td></tr>
<tr><td><code>show access-lists</code></td><td>Does the classification ACL contain what you think?</td></tr>
<tr><td><code>show mls qos interface INTF</code></td><td>Is the switch port trusted or does it reset DSCP?</td></tr>
<tr><td><code>traffic show</code> (simulator host)</td><td>What did the test flow send, deliver and lose?</td></tr>
</table></div>
<p>Remember that <code>show class-map</code> and <code>show policy-map</code> print definitions only. Packet counters appear only in <code>show policy-map interface</code>.</p>

<h3>A six-step method</h3>
<ol>
<li><b>Is a policy attached?</b> <code>show policy-map interface</code> prints nothing for an interface without a policy.</li>
<li><b>Which direction?</b> Read the header: <code>Service-policy input:</code> or <code>output:</code>. Marking belongs on the interface where traffic <i>enters</i>.</li>
<li><b>Do the classes match?</b> If a class shows 0 packets but class-default shows thousands, the match is wrong.</li>
<li><b>Is the mark arriving?</b> A queuing class matching DSCP stays at 0 if upstream devices never marked, or rewrote the value.</li>
<li><b>Are the actions sensible?</b> Priority rate versus offered voice, police rate versus real load, total reservations versus link speed.</li>
<li><b>Generate traffic and recheck.</b> Counters only move with traffic. Recheck after each change.</li>
</ol>

<h3>Symptom to command to fix</h3>
<div class="tbl"><table>
<tr><th>Symptom</th><th>First command</th><th>What you see</th><th>Fix</th></tr>
<tr><td>Policy exists but nothing changes</td><td><code>show policy-map interface</code></td><td>No output for the port</td><td>Attach it: <code>service-policy input|output NAME</code></td></tr>
<tr><td>All classes show 0 packets on the LAN port</td><td><code>show policy-map interface Gi0/1</code></td><td>Header says <code>output</code></td><td>Marking policy on the wrong direction: use <code>no service-policy output NAME</code>, then <code>service-policy input NAME</code></td></tr>
<tr><td>Voice class 0, class-default full</td><td><code>show access-lists</code>, <code>show class-map</code></td><td>ACL range, subnet or protocol does not match the real flow</td><td>Correct the ACL (subnet, UDP port range); re-test</td></tr>
<tr><td>EF queue on the WAN stays at 0</td><td>Policy on LAN input</td><td>LAN class-default re-marked everything to DSCP 0</td><td>Classify voice before class-default, or trust the phone's DSCP</td></tr>
<tr><td>Counters do not increment</td><td><code>traffic show</code>, then counters</td><td>No test traffic, or it takes another path</td><td>Send traffic through that interface; check routing and which port the flow uses</td></tr>
<tr><td>Voice drops with "b/w exceed drops"</td><td><code>show policy-map interface ... output</code></td><td>Priority rate lower than the offered voice</td><td>Size <code>priority</code> for the real calls, or limit the calls</td></tr>
<tr><td>Policy rejected: "requested bandwidth ... available only"</td><td>Message when attaching</td><td>Priority plus bandwidth exceeds the link</td><td>Reduce reservations so the total fits</td></tr>
<tr><td>Policy rejected: "allowed only in the output direction"</td><td>Message when attaching</td><td>Queuing action in an input policy</td><td>Attach as output, or move queuing out of the policy</td></tr>
<tr><td>One class takes too little</td><td>Police counters</td><td><code>exceeded</code> packets high</td><td>Raise the police rate or fix the offending traffic</td></tr>
<tr><td>Switch traffic ends up at DSCP 0</td><td><code>show mls qos interface</code></td><td><code>not trusted</code></td><td><code>mls qos trust dscp</code> on the port that should be trusted</td></tr>
</table></div>

<h3>Worked story: Pune calls are choppy again</h3>
<div class="scn"><h4>The policy that looked perfect</h4><p>A new engineer built the branch QoS and reported "done", but the calls were still robotic in the evening. You log in to R1. First, the WAN port. Is the EF queue seeing voice?</p></div>
<pre class="code">R1# show policy-map interface GigabitEthernet0/0 output</pre>
<pre class="out"> GigabitEthernet0/0 

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)  
      0 packets, 0 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: dscp ef (46)
        0 packets, 0 bytes
        30 second rate 0000 bps
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      Queueing
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 0/0</pre>
<p>EF-Q has 0 packets even though the phones are calling. Nothing marked EF is arriving, so look upstream at the marking policy on the LAN port.</p>
<pre class="code">R1# show policy-map interface GigabitEthernet0/1
R1# show access-lists</pre>
<pre class="out"> GigabitEthernet0/1 

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

Extended IP access list VOICE-RTP
    10 permit udp 10.10.20.0 0.0.0.255 any range 16384 32767</pre>
<p>Two faults at once. First, the header says <code>Service-policy output: MARK-IN</code> on the LAN port: both VOICE and class-default show zero packets, because traffic from the LAN <i>enters</i> this port and never leaves through it, so an output policy there never sees it. Second, the ACL permits <code>10.10.20.0</code> but the phones are on <code>10.10.10.0</code>, so even in the right direction VOICE would never match. The phone's own test flow confirms the damage:</p>
<pre class="out">ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  0     400      20/20 5000      4664       6.7%</pre>
<p>The fix is to remove the output attachment, attach input, and correct the ACL.</p>
<pre class="code">R1(config)# no ip access-list extended VOICE-RTP
R1(config)# ip access-list extended VOICE-RTP
R1(config-ext-nacl)# permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
R1(config)# interface GigabitEthernet0/1
R1(config-if)# no service-policy output MARK-IN
R1(config-if)# service-policy input MARK-IN
PHONE> traffic 10.20.0.100 udp/20000 400 20
R1# show policy-map interface GigabitEthernet0/1 input</pre>
<pre class="out"> GigabitEthernet0/1 

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)  
      5000 packets, 1000000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name VOICE-RTP
        5000 packets, 1000000 bytes
        30 second rate 0000 bps
      QoS Set
        dscp ef
          Packets marked 5000

ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
2   10.20.0.100        udp/20000  0     400      20/20 5000      5000       0.0%</pre>
<p>VOICE now counts 5,000 packets marked EF, and the new flow (number 2) shows 0.0% loss, against 6.7% for flow 1 before the fix. Always finish with a traffic test.</p>

<h3>Markings rewritten at the trust boundary</h3>
<p>This one is subtle. Suppose the phone already marks its voice EF (DSCP 46), and your LAN policy has only <code>class class-default</code> with <code>set dscp default</code>, meant to scrub the PCs. If voice never matches an earlier class, class-default scrubs the phone's EF mark too.</p>
<pre class="out">  Service-policy input: MARK-IN

    Class-map: class-default (match-any)  
      155000 packets, 31000000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 
      QoS Set
        dscp default
          Packets marked 155000

ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  46    400      20/20 5000      4664       6.7%</pre>
<p>The phone flow left the source with DSCP 46, but all 155,000 packets (voice included) were set to default, so the EF-Q on the WAN saw nothing and the call lost 6.7%. The fix is either to classify voice first (by DSCP or ACL) and keep its marking, or to trust the port.</p>

<h3>Admission errors when attaching</h3>
<p>The router refuses policies it cannot honour. With a 10 Mbps WAN, a 9000 kbps priority class plus a 2000 kbps bandwidth class over-subscribes the link:</p>
<pre class="out">I/f GigabitEthernet0/0 class AF11-Q requested bandwidth 2000 (kbps), available only 1000 (kbps)
% Service policy BAD not attached</pre>
<p>Real IOS also keeps a safety margin: by default only 75% of the interface bandwidth may be reserved for priority and bandwidth classes. Putting a queuing action in an input policy gives a different refusal:</p>
<pre class="out">Queueing actions (priority, bandwidth, shape, fair-queue) are allowed only in the output direction
% Service policy OK not attached to GigabitEthernet0/1 input</pre>

<div class="eg"><p><b>Worked example.</b> Read a queue line the way a NOC engineer does: <code>(queue depth/total drops/no-buffer drops) 0/1757/0</code> means the queue is empty now (0), 1,757 packets were dropped in total, and none were lost for lack of buffer memory. For a priority class, depth 0 is good, and drops tell you the offered rate is above the configured rate. For class-default with 27,000 drops during a backup, nobody cares; that is the class designed to absorb loss.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading <code>show policy-map</code> and declaring the policy "working": it only shows configuration. Fixing the symptom in the WAN policy when the cause is at the LAN edge. Changing five things at once so you cannot tell what fixed it. Forgetting that counters are cumulative: note the numbers before a test and compare after it.</p></div>

<div class="exam"><p><b>Exam traps.</b> Counters live in <code>show policy-map interface</code>. A policy that is not attached does nothing. Marking is normally input at the edge; queuing is output. An ACL in a class-map selects, never blocks. Over-subscription is rejected at attach time. If a class shows zero while class-default is full, the match is wrong. Markings must survive each hop or be re-created.</p></div>

<div class="iv"><p class="q">"Users say video calls are poor. How do you check QoS?"</p><p>Confirm the symptom is congestion (utilisation, queue drops). Then <code>show policy-map interface</code> on the WAN output: is the video class seeing packets, and is it dropping? If the class shows zero, trace the marking back to the edge: policy attached on input, ACL or DSCP match correct, trust boundary not rewriting the value. Re-test with traffic and compare counters before and after.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show policy-map interface</code> is the verification command: header gives direction, per-class counters show matches, marks and drops.</li>
<li>Walk the path: attached, direction, match, mark arriving, sensible rates, then test with traffic.</li>
<li>Typical faults: policy not attached, wrong direction, ACL not matching, mark rewritten at the boundary, LLQ rate too small, over-subscription.</li>
<li>Zero in a specific class with a busy class-default means classification is the problem.</li>
<li>Change one thing, generate traffic, read the counters again.</li>
</ul></div>
`,hi:`
<p>Courier parcel late ho jaye to achha dispatcher andaza nahi lagata. Woh label, jis sorting belt par daala gaya, aur kis van ne uthaya, yeh teeno us order mein check karta hai. QoS faults rahasyamayi lagte hain ("calls kharab hain par config sahi dikh rahi hai") kyunki config fault chhupne ki chaar jagahon mein se sirf ek hai. QoS troubleshooting ek chhota, dohraaya ja sakne wala safar hai: policy attached hai, sahi direction mein hai, sahi traffic match kar rahi hai, sahi marking aa rahi hai, aur counters chal rahe hain?</p>

<h3>Aapka verification toolkit</h3>
<div class="tbl"><table>
<tr><th>Command</th><th>Kya jawab deta hai</th></tr>
<tr><td><code>show class-map [NAME]</code></td><td>Har class kya match karti hai?</td></tr>
<tr><td><code>show policy-map [NAME]</code></td><td>Har policy kaunse actions lagati hai?</td></tr>
<tr><td><code>show policy-map interface [INTF] [input|output]</code></td><td>Attached hai, kis direction mein, aur counters chal rahe hain? Sabse zaroori command.</td></tr>
<tr><td><code>show running-config interface INTF</code></td><td>Port par asal mein kaunsi <code>service-policy</code> lines hain?</td></tr>
<tr><td><code>show access-lists</code></td><td>Classification ACL mein wahi hai jo aap sochte ho?</td></tr>
<tr><td><code>show mls qos interface INTF</code></td><td>Switch port trusted hai ya DSCP reset karta hai?</td></tr>
<tr><td><code>traffic show</code> (simulator host)</td><td>Test flow ne kitna bheja, pahunchaya aur khoya?</td></tr>
</table></div>
<p>Yaad rakho: <code>show class-map</code> aur <code>show policy-map</code> sirf definitions print karte hain. Packet counters sirf <code>show policy-map interface</code> mein aate hain.</p>

<h3>Chhe-step method</h3>
<ol>
<li><b>Policy attached hai?</b> Bina policy wale interface ke liye <code>show policy-map interface</code> kuch print nahi karta.</li>
<li><b>Kaunsi direction?</b> Header padho: <code>Service-policy input:</code> ya <code>output:</code>. Marking us interface par honi chahiye jahan traffic <i>andar aata</i> hai.</li>
<li><b>Classes match karti hain?</b> Agar class 0 packets dikhaye lekin class-default hazaaron, to match galat hai.</li>
<li><b>Mark aa raha hai?</b> DSCP match karne wali queuing class 0 par rehti hai agar upstream devices ne kabhi mark nahi kiya, ya value rewrite kar di.</li>
<li><b>Actions sensible hain?</b> Priority rate versus offered voice, police rate versus asli load, kul reservations versus link speed.</li>
<li><b>Traffic bhejo aur dobara check karo.</b> Counters sirf traffic ke saath chalte hain. Har change ke baad dobara dekho.</li>
</ol>

<h3>Symptom se command se fix</h3>
<div class="tbl"><table>
<tr><th>Symptom</th><th>Pehla command</th><th>Kya dikhta hai</th><th>Fix</th></tr>
<tr><td>Policy hai lekin kuch nahi badla</td><td><code>show policy-map interface</code></td><td>Port ke liye koi output nahi</td><td>Attach karo: <code>service-policy input|output NAME</code></td></tr>
<tr><td>LAN port par saari classes 0 packets dikhati hain</td><td><code>show policy-map interface Gi0/1</code></td><td>Header mein <code>output</code></td><td>Marking policy galat direction mein: <code>no service-policy output NAME</code>, phir <code>service-policy input NAME</code></td></tr>
<tr><td>Voice class 0, class-default full</td><td><code>show access-lists</code>, <code>show class-map</code></td><td>ACL range, subnet ya protocol asli flow se match nahi karta</td><td>ACL theek karo (subnet, UDP port range); dobara test</td></tr>
<tr><td>WAN par EF queue 0 par</td><td>LAN input par policy</td><td>LAN class-default ne sab DSCP 0 mein re-mark kar diya</td><td>Voice ko class-default se pehle classify karo, ya phone ka DSCP trust karo</td></tr>
<tr><td>Counters increment nahi hote</td><td><code>traffic show</code>, phir counters</td><td>Test traffic nahi, ya woh doosre path se jaata hai</td><td>Us interface se traffic bhejo; routing aur flow ka port check karo</td></tr>
<tr><td>Voice "b/w exceed drops" ke saath drop hoti hai</td><td><code>show policy-map interface ... output</code></td><td>Priority rate offered voice se kam</td><td><code>priority</code> ko asli calls ke hisaab se size karo, ya calls limit karo</td></tr>
<tr><td>Policy reject: "requested bandwidth ... available only"</td><td>Attach karte waqt message</td><td>Priority plus bandwidth link se zyada</td><td>Reservations kam karo taaki jod fit ho</td></tr>
<tr><td>Policy reject: "allowed only in the output direction"</td><td>Attach karte waqt message</td><td>Input policy mein queuing action</td><td>Output mein attach karo, ya queuing ko policy se hatao</td></tr>
<tr><td>Ek class ko bahut kam milta hai</td><td>Police counters</td><td><code>exceeded</code> packets zyada</td><td>Police rate badhao ya offending traffic theek karo</td></tr>
<tr><td>Switch traffic DSCP 0 par pahunchta hai</td><td><code>show mls qos interface</code></td><td><code>not trusted</code></td><td>Jis port ko trusted hona hai us par <code>mls qos trust dscp</code></td></tr>
</table></div>

<h3>Worked story: Pune ki calls phir choppy</h3>
<div class="scn"><h4>Woh policy jo perfect dikhti thi</h4><p>Ek naye engineer ne branch QoS banayi aur "done" report kiya, lekin shaam ko calls ab bhi robotic thi. Aap R1 par login karte ho. Pehle WAN port. Kya EF queue voice dekh rahi hai?</p></div>
<pre class="code">R1# show policy-map interface GigabitEthernet0/0 output</pre>
<pre class="out"> GigabitEthernet0/0 

  Service-policy output: WAN-OUT

    Class-map: EF-Q (match-any)  
      0 packets, 0 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: dscp ef (46)
        0 packets, 0 bytes
        30 second rate 0000 bps
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      Queueing
      queue limit 512 packets
      (queue depth/total drops/no-buffer drops) 0/0/0
      (pkts output/bytes output) 0/0</pre>
<p>Phones call kar rahe hain phir bhi EF-Q mein 0 packets hain. Kuch EF-marked aa hi nahi raha, isliye upstream dekho: LAN port par marking policy.</p>
<pre class="code">R1# show policy-map interface GigabitEthernet0/1
R1# show access-lists</pre>
<pre class="out"> GigabitEthernet0/1 

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

Extended IP access list VOICE-RTP
    10 permit udp 10.10.20.0 0.0.0.255 any range 16384 32767</pre>
<p>Ek saath do faults. Pehla, LAN port par header kehta hai <code>Service-policy output: MARK-IN</code>: VOICE aur class-default dono zero packets dikhate hain, kyunki LAN ka traffic is port mein <i>andar aata</i> hai aur isse bahar nahi jaata, isliye wahan ki output policy use kabhi dekhti hi nahi. Doosra, ACL <code>10.10.20.0</code> permit karti hai jabki phones <code>10.10.10.0</code> par hain, isliye sahi direction mein bhi VOICE kabhi match nahi karti. Phone ka apna test flow nuksan confirm karta hai:</p>
<pre class="out">ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  0     400      20/20 5000      4664       6.7%</pre>
<p>Fix hai output attachment hatao, input attach karo, aur ACL theek karo.</p>
<pre class="code">R1(config)# no ip access-list extended VOICE-RTP
R1(config)# ip access-list extended VOICE-RTP
R1(config-ext-nacl)# permit udp 10.10.10.0 0.0.0.255 any range 16384 32767
R1(config)# interface GigabitEthernet0/1
R1(config-if)# no service-policy output MARK-IN
R1(config-if)# service-policy input MARK-IN
PHONE> traffic 10.20.0.100 udp/20000 400 20
R1# show policy-map interface GigabitEthernet0/1 input</pre>
<pre class="out"> GigabitEthernet0/1 

  Service-policy input: MARK-IN

    Class-map: VOICE (match-any)  
      5000 packets, 1000000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: access-group name VOICE-RTP
        5000 packets, 1000000 bytes
        30 second rate 0000 bps
      QoS Set
        dscp ef
          Packets marked 5000

ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
2   10.20.0.100        udp/20000  0     400      20/20 5000      5000       0.0%</pre>
<p>VOICE ab 5,000 packets EF marked ginti hai, aur naya flow (number 2) 0.0% loss dikhata hai, jabki fix se pehle flow 1 par 6.7% tha. Hamesha traffic test se khatam karo.</p>

<h3>Trust boundary par rewrite hui markings</h3>
<p>Yeh subtle hai. Maan lo phone pehle se apni voice EF (DSCP 46) mark karta hai, aur aapki LAN policy mein sirf <code>class class-default</code> aur <code>set dscp default</code> hai, jo PCs ko scrub karne ke liye thi. Agar voice kisi pehli class se match nahi karti, to class-default phone ka EF mark bhi scrub kar deti hai.</p>
<pre class="out">  Service-policy input: MARK-IN

    Class-map: class-default (match-any)  
      155000 packets, 31000000 bytes
      30 second offered rate 0000 bps, drop rate 0000 bps
      Match: any 
      QoS Set
        dscp default
          Packets marked 155000

ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.20.0.100        udp/20000  46    400      20/20 5000      4664       6.7%</pre>
<p>Phone flow source se DSCP 46 ke saath nikla, lekin saare 155,000 packets (voice samet) default set ho gaye, isliye WAN par EF-Q ne kuch nahi dekha aur call ne 6.7% khoya. Fix: ya to voice ko pehle classify karo (DSCP ya ACL se) aur uski marking rakho, ya port ko trust karo.</p>

<h3>Attach karte waqt admission errors</h3>
<p>Router woh policies reject karta hai jo woh nibha nahi sakta. 10 Mbps WAN par 9000 kbps priority class plus 2000 kbps bandwidth class link ko over-subscribe karti hai:</p>
<pre class="out">I/f GigabitEthernet0/0 class AF11-Q requested bandwidth 2000 (kbps), available only 1000 (kbps)
% Service policy BAD not attached</pre>
<p>Real IOS safety margin bhi rakhta hai: default mein interface bandwidth ka sirf 75% priority aur bandwidth classes ke liye reserve ho sakta hai. Input policy mein queuing action daalne par alag refusal milta hai:</p>
<pre class="out">Queueing actions (priority, bandwidth, shape, fair-queue) are allowed only in the output direction
% Service policy OK not attached to GigabitEthernet0/1 input</pre>

<div class="eg"><p><b>Worked example.</b> Queue line ko NOC engineer ki tarah padho: <code>(queue depth/total drops/no-buffer drops) 0/1757/0</code> ka matlab queue abhi khali hai (0), kul 1,757 packets drop hue, aur buffer memory ki kami se koi nahi khoya. Priority class ke liye depth 0 achhi baat hai, aur drops batate hain ki offered rate configured rate se upar hai. Backup ke dauran class-default mein 27,000 drops par koi chinta nahi karta; woh class loss absorb karne ke liye hi bani hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>show policy-map</code> padhkar policy ko "working" bol dena: woh sirf configuration dikhata hai. Cause LAN edge par ho aur fix WAN policy mein karna. Ek saath paanch cheezein badalna, phir pata nahi chalta kisne fix kiya. Bhool jaana ki counters cumulative hain: test se pehle ke numbers note karo aur baad mein compare karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Counters <code>show policy-map interface</code> mein hain. Attach na ki gayi policy kuch nahi karti. Marking aam taur par edge par input mein; queuing output mein. Class-map ka ACL chunta hai, kabhi block nahi karta. Over-subscription attach ke waqt reject hoti hai. Agar koi class zero dikhaye jabki class-default full hai, to match galat hai. Markings har hop se bachni chahiye ya dobara banni chahiye.</p></div>

<div class="iv"><p class="q">"Users kehte hain video calls kharab hain. QoS kaise check karoge?"</p><p>Pehle confirm karo ki symptom congestion hai (utilisation, queue drops). Phir WAN output par <code>show policy-map interface</code>: video class packets dekh rahi hai, aur drop kar rahi hai? Agar class zero dikhaye, to marking ko edge tak trace karo: input par policy attached, ACL ya DSCP match sahi, trust boundary value rewrite nahi kar rahi. Traffic se dobara test karo aur pehle-baad counters compare karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show policy-map interface</code> verification command hai: header direction deta hai, per-class counters matches, marks aur drops dikhate hain.</li>
<li>Path chalo: attached, direction, match, mark aa raha hai, sensible rates, phir traffic se test.</li>
<li>Aam faults: policy attach nahi, galat direction, ACL match nahi, boundary par mark rewrite, LLQ rate chhota, over-subscription.</li>
<li>Kisi khaas class mein zero aur class-default busy ho to classification problem hai.</li>
<li>Ek cheez badlo, traffic bhejo, counters dobara padho.</li>
</ul></div>
`}};export{e as default};