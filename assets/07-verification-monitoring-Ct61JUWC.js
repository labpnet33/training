var e={id:`verification-monitoring`,h:{en:`Verification and monitoring: counters, test traffic, IP SLA, captures`,hi:`Verification aur monitoring: counters, test traffic, IP SLA, captures`},body:{en:`<h3>A policy is not finished until it is proven</h3>
<p>Every QoS change should end with the same four proofs. Keep them as a short checklist and run them each time, in this order.</p>
<ol><li><b>Classification</b>: do the packets land in the class I expect? (<code>show policy-map interface</code>, class counters.)</li>
<li><b>Marking</b>: is the DSCP on the wire what I intended, and does it survive the provider? (counters "Packets marked", capture, <code>dscpSeen</code> in the labs.)</li>
<li><b>Queueing</b>: under load, does voice have zero drops while best effort pays? (queue drops per class, "b/w exceed drops".)</li>
<li><b>End result</b>: does a real or generated call stay clean? (test traffic, IP SLA, MOS.)</li></ol>
<h3>1 and 3: show policy-map interface</h3>
<p>This command is the single most useful QoS tool. Run it on the LAN input to check marking, on the WAN output to check queueing. This is real output from the design lab, after Pune sent a 10-call voice stream, a 3 Mbps video stream and a 12 Mbps backup together for 20 seconds:</p>
<pre class="out">R-PUN#show policy-map interface GigabitEthernet0/1 input
  Service-policy input: MARK-IN
    Class-map: VOICE (match-any)
      10000 packets, 2000000 bytes
      Match: access-group name VOICE-RTP
      QoS Set
        dscp ef
          <span class="hl">Packets marked 10000</span>
    Class-map: BULK (match-any)
      21420 packets, 29988000 bytes
      QoS Set
        dscp af11
          Packets marked 21420

R-PUN#show policy-map interface GigabitEthernet0/0 output
    Class-map: EF-Q (match-any)
      10000 packets, 2000000 bytes
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      (queue depth/total drops/no-buffer drops) <span class="hl">0/0/0</span>
    Class-map: AF41-Q (match-any)
      37500 packets, 7500000 bytes
      (queue depth/total drops/no-buffer drops) 0/0/0
      bandwidth 3000 kbps
    Class-map: class-default (match-any)
      21420 packets, 29988000 bytes
      (queue depth/total drops/no-buffer drops) <span class="hl">0/5972/0</span></pre>
<p>Read it like a doctor reads a chart: voice and video counters equal what was sent and their drops are zero; only class-default drops, 5972 packets. The 30-second rate lines show 0000 bps here only because the lab traffic had already ended when the command ran; run the command <i>during</i> the load to see live rates. Use <code>clear counters</code> before a test so that the numbers belong to the test.</p>
<h3>2: marking on the wire</h3>
<p>Counters show what the router did. To see what <i>left</i> the router, capture packets. On a router, <code>monitor capture</code> (embedded packet capture) can write a buffer you open in a decoder; the filter <code>ip.dsfield.dscp == 46</code> shows EF packets in Wireshark. Do the capture on both sides of the provider: if EF leaves R-PUN and arrives as 0 at R-MUM, the provider reset it. In the simulator the same idea is the check <code>dscpSeen</code>: how many packets with a given DSCP were seen leaving an interface.</p>
<h3>4: test traffic and ping</h3>
<p>A normal ping sends best-effort packets and tells you nothing about voice. Mark the test packets like voice and make them look like voice: <code>ping 10.1.0.10 size 200 tos 184 repeat 100</code> (TOS 184 is DSCP 46 shifted two bits left, 46 x 4 = 184). A pure ping under load is still informative: average latency under load that is far above the idle value is queueing. In the simulator the host command does the same job with proper rates:</p>
<pre class="out">PH-PUN# traffic 10.1.0.10 udp/16500 800 20
Flow 1: 10.2.0.10 -> 10.1.0.10 UDP dport 16500, DSCP 0 (DEFAULT), 800 kbps for 20 s
        500 packets/s x 200 bytes; running in the background ("traffic show" for progress)
PH-PUN# traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.1.0.10          udp/16500  0     800      20/20 10000     10000      <span class="hl">0.0%</span></pre>
<p>The DSCP column shows what the host sent (0): the router at the LAN edge marks it EF. Loss 0.0 percent is the result you want for voice.</p>
<h3>IP SLA: a permanent synthetic call</h3>
<p>For a live network, use <b>IP SLA</b>: the router sends synthetic voice packets to another router and measures delay, jitter, loss and an estimated MOS, every few minutes, forever.</p>
<pre class="code">ip sla 10
 udp-jitter 10.1.0.1 16500 codec g711ulaw codec-numpackets 1000 codec-interval 20
 tos 184
 frequency 300
ip sla schedule 10 life forever start-time now</pre>
<pre class="out">R-PUN#show ip sla statistics 10
IPSLAs Latest Operation Statistics

IPSLA operation id: 10
Type of operation: udp-jitter
Latest operation return code: OK
RTT Values:
        Number Of RTT: 1000     RTT Min/Avg/Max: 21/22/31 milliseconds
Source to Destination Jitter Min/Avg/Max: 0/2/6 milliseconds
Destination to Source Jitter Min/Avg/Max: 0/1/5 milliseconds
Packet Loss Values:
        Loss Source to Destination: 0
        Loss Destination to Source: 0
Voice Score Values:
        <span class="hl">MOS score: 4.34</span></pre>
<p>This output is typical of a healthy G.711 path (the simulator does not run IP SLA; the figures are an example of a real device). The <code>tos 184</code> line sends the probe as EF so the probe sees what a call sees. Alert when jitter exceeds 30 ms, loss exceeds 1 percent or MOS drops under 3.8 for G.711.</p>
<div class="note"><p><b>Junos note.</b> Use <code>show class-of-service interface ge-0/0/0</code> for the scheduler map and queue counters, and <code>show interfaces queue ge-0/0/0</code> for per-queue packets and drops. Synthetic probes use RPM: <code>set services rpm probe VOICE test T1 probe-type udp-ping-timestamp</code> with <code>dscp-code-point ef</code>.</p></div>
<h3>Two quick health checks that are often forgotten</h3>
<ul><li><b>Interface errors</b>: <code>show interfaces</code> with input errors, CRC or output drops on a voice path can explain loss that no QoS counter shows. A duplex mismatch gives exactly the 1 to 3 percent loss that makes calls crackle.</li>
<li><b>CPU and the control plane</b>: a high CPU can delay voice that is process-switched. Voice should be forwarded in hardware or by fast switching.</li></ul>
<div class="warn"><p><b>Common mistake.</b> Testing on an idle link. With no congestion no packet waits and no drop shows, so a broken policy looks perfect. Always create the load (a backup flow) while you run the voice test.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Matched" counters in <code>show policy-map interface</code> are counted before queueing, so they increase even when the packet is later dropped. The drops are in the queueing line, not in the match line.</p></div>
<div class="scn"><h4>Scenario: Green dashboard, angry users</h4><p>The Delhi dashboard showed all policy classes healthy and no drops. Yet users complained. The engineer ran the voice test on the idle afternoon link: perfect. At 18:00 he started a backup test alongside the call: the call lost 6 percent. The policy was attached outbound on the wrong interface (the LAN side), so it never saw congestion. Moving it to the WAN made the load test pass.</p><p><b>Lesson:</b> Verify under load. A test without congestion proves nothing about QoS.</p></div>
<div class="iv"><p class="q">"How do you prove QoS is working after a change?"</p><p>Four steps: classification counters, marking on the wire (capture or counters), queue drops under load with voice at zero, and an end-to-end synthetic call with IP SLA or test traffic. Add that you clear counters first and test while the link is deliberately loaded.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Proof order: classification, marking, queueing, end result.</li><li>show policy-map interface is the main tool: input for marking, output for queueing and drops.</li><li>Capture on both sides of the provider to see if DSCP survives.</li><li>IP SLA udp-jitter with tos 184 gives permanent delay, jitter, loss and MOS.</li><li>Always test under load, never on an idle link.</li></ul></div>`,hi:`<h3>Policy tab tak poori nahi jab tak sabit na ho</h3>
<p>Har QoS change ko wahi chaar proofs par khatam hona chahiye. Unhe chhoti checklist ki tarah rakho aur har baar isi kram mein chalao.</p>
<ol><li><b>Classification</b>: kya packets us class mein jaa rahe hain jiski mujhe umeed hai? (<code>show policy-map interface</code>, class counters.)</li>
<li><b>Marking</b>: kya wire par DSCP wahi hai jo maine socha, aur kya woh provider se bach kar nikalta hai? (counters "Packets marked", capture, labs mein <code>dscpSeen</code>.)</li>
<li><b>Queueing</b>: load mein kya voice ke drops zero hain jabki best effort bharta hai? (class ke queue drops, "b/w exceed drops".)</li>
<li><b>Antim nateeja</b>: kya asli ya generated call saaf rehti hai? (test traffic, IP SLA, MOS.)</li></ol>
<h3>1 aur 3: show policy-map interface</h3>
<p>Yeh command sabse upyogi QoS tool hai. Marking check karne ke liye LAN input par, queueing check karne ke liye WAN output par chalao. Yeh design lab ka asli output hai, jab Pune ne 10-call voice stream, 3 Mbps video stream aur 12 Mbps backup ek saath 20 seconds ke liye bheje:</p>
<pre class="out">R-PUN#show policy-map interface GigabitEthernet0/1 input
  Service-policy input: MARK-IN
    Class-map: VOICE (match-any)
      10000 packets, 2000000 bytes
      Match: access-group name VOICE-RTP
      QoS Set
        dscp ef
          <span class="hl">Packets marked 10000</span>
    Class-map: BULK (match-any)
      21420 packets, 29988000 bytes
      QoS Set
        dscp af11
          Packets marked 21420

R-PUN#show policy-map interface GigabitEthernet0/0 output
    Class-map: EF-Q (match-any)
      10000 packets, 2000000 bytes
      Priority: 1000 kbps, burst bytes 25000, b/w exceed drops: 0
      (queue depth/total drops/no-buffer drops) <span class="hl">0/0/0</span>
    Class-map: AF41-Q (match-any)
      37500 packets, 7500000 bytes
      (queue depth/total drops/no-buffer drops) 0/0/0
      bandwidth 3000 kbps
    Class-map: class-default (match-any)
      21420 packets, 29988000 bytes
      (queue depth/total drops/no-buffer drops) <span class="hl">0/5972/0</span></pre>
<p>Ise aise padho jaise doctor chart padhta hai: voice aur video counters bheje gaye ke barabar hain aur unke drops zero hain; sirf class-default drop karti hai, 5972 packets. 30-second rate lines yahan 0000 bps isliye dikhati hain kyunki command chalne tak lab traffic khatam ho chuka tha; live rates dekhne ke liye command load ke <i>dauran</i> chalao. Test se pehle <code>clear counters</code> chalao taaki numbers test ke hon.</p>
<h3>2: wire par marking</h3>
<p>Counters batate hain router ne kya kiya. Jo router se <i>nikla</i> woh dekhne ke liye packets capture karo. Router par <code>monitor capture</code> (embedded packet capture) ek buffer likh sakta hai jise decoder mein kholte ho; Wireshark mein filter <code>ip.dsfield.dscp == 46</code> EF packets dikhata hai. Capture provider ke dono taraf karo: agar EF R-PUN se nikalta hai aur R-MUM par 0 ban kar pahunchta hai, to provider ne use reset kiya. Simulator mein wahi idea <code>dscpSeen</code> check hai: kisi interface se nikalte hue di gayi DSCP ke kitne packets dekhe gaye.</p>
<h3>4: test traffic aur ping</h3>
<p>Normal ping best-effort packets bhejta hai aur voice ke baare mein kuch nahi batata. Test packets ko voice ki tarah mark karo aur voice jaise dikhao: <code>ping 10.1.0.10 size 200 tos 184 repeat 100</code> (TOS 184 do bit left shift kiya hua DSCP 46 hai, 46 x 4 = 184). Load mein sada ping bhi kuch batata hai: load mein average latency idle value se bahut zyada ho to woh queueing hai. Simulator mein host command sahi rates ke saath wahi kaam karta hai:</p>
<pre class="out">PH-PUN# traffic 10.1.0.10 udp/16500 800 20
Flow 1: 10.2.0.10 -> 10.1.0.10 UDP dport 16500, DSCP 0 (DEFAULT), 800 kbps for 20 s
        500 packets/s x 200 bytes; running in the background ("traffic show" for progress)
PH-PUN# traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.1.0.10          udp/16500  0     800      20/20 10000     10000      <span class="hl">0.0%</span></pre>
<p>DSCP column woh dikhata hai jo host ne bheja (0): LAN edge ka router use EF mark karta hai. Voice ke liye Loss 0.0 percent wahi nateeja hai jo chahiye.</p>
<h3>IP SLA: sthayi synthetic call</h3>
<p>Live network ke liye <b>IP SLA</b> use karo: router doosre router ko synthetic voice packets bhejta hai aur har kuch minute mein, hamesha, delay, jitter, loss aur estimated MOS naapta hai.</p>
<pre class="code">ip sla 10
 udp-jitter 10.1.0.1 16500 codec g711ulaw codec-numpackets 1000 codec-interval 20
 tos 184
 frequency 300
ip sla schedule 10 life forever start-time now</pre>
<pre class="out">R-PUN#show ip sla statistics 10
IPSLAs Latest Operation Statistics

IPSLA operation id: 10
Type of operation: udp-jitter
Latest operation return code: OK
RTT Values:
        Number Of RTT: 1000     RTT Min/Avg/Max: 21/22/31 milliseconds
Source to Destination Jitter Min/Avg/Max: 0/2/6 milliseconds
Destination to Source Jitter Min/Avg/Max: 0/1/5 milliseconds
Packet Loss Values:
        Loss Source to Destination: 0
        Loss Destination to Source: 0
Voice Score Values:
        <span class="hl">MOS score: 4.34</span></pre>
<p>Yeh output swasth G.711 path ka typical hai (simulator IP SLA nahi chalata; figures real device ka udaharan hain). <code>tos 184</code> line probe ko EF ki tarah bhejti hai taaki probe wahi dekhe jo call dekhti hai. Jab jitter 30 ms se zyada ho, loss 1 percent se zyada ho ya G.711 ke liye MOS 3.8 se neeche jaaye to alert lagao.</p>
<div class="note"><p><b>Junos note.</b> Scheduler map aur queue counters ke liye <code>show class-of-service interface ge-0/0/0</code> aur har queue ke packets aur drops ke liye <code>show interfaces queue ge-0/0/0</code> use karo. Synthetic probes RPM se chalte hain: <code>set services rpm probe VOICE test T1 probe-type udp-ping-timestamp</code> aur <code>dscp-code-point ef</code> ke saath.</p></div>
<h3>Do tez health checks jo aksar bhool jaate hain</h3>
<ul><li><b>Interface errors</b>: voice path par <code>show interfaces</code> ke input errors, CRC ya output drops aisa loss samjha sakte hain jo koi QoS counter nahi dikhata. Duplex mismatch theek wahi 1 se 3 percent loss deta hai jo calls ko crackle karata hai.</li>
<li><b>CPU aur control plane</b>: high CPU process-switched voice ko late kar sakta hai. Voice hardware ya fast switching se forward honi chahiye.</li></ul>
<div class="warn"><p><b>Common mistake.</b> Idle link par test karna. Congestion na ho to koi packet intezaar nahi karta aur koi drop nahi dikhta, isliye tuti hui policy perfect dikhti hai. Voice test chalate waqt hamesha load banao (backup flow).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show policy-map interface</code> ke "matched" counters queueing se pehle gine jaate hain, isliye packet baad mein drop ho tab bhi badhte hain. Drops queueing line mein hain, match line mein nahi.</p></div>
<div class="scn"><h4>Scenario: Dashboard hara, users naraaz</h4><p>Delhi dashboard saari policy classes healthy aur koi drop nahi dikhata tha. Phir bhi users shikayat karte the. Engineer ne voice test idle dopahar ke link par chalaya: perfect. 18:00 baje usne call ke saath backup test shuru kiya: call ne 6 percent loss kiya. Policy galat interface par (LAN side) outbound lagi thi, isliye congestion kabhi dekhti hi nahi thi. Use WAN par le jaane se load test pass hua.</p><p><b>Lesson:</b> Load mein verify karo. Congestion ke bina test QoS ke baare mein kuch sabit nahi karta.</p></div>
<div class="iv"><p class="q">"Change ke baad kaise sabit karte ho ki QoS kaam kar raha hai?"</p><p>Chaar steps: classification counters, wire par marking (capture ya counters), load mein queue drops jahan voice zero ho, aur IP SLA ya test traffic se end-to-end synthetic call. Jodo ki pehle counters clear karte ho aur test ke dauran link ko jaanbujhkar load karte ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Proof ka kram: classification, marking, queueing, antim nateeja.</li><li>show policy-map interface mukhya tool hai: marking ke liye input, queueing aur drops ke liye output.</li><li>DSCP bachta hai ya nahi dekhne ke liye provider ke dono taraf capture karo.</li><li>IP SLA udp-jitter tos 184 ke saath sthayi delay, jitter, loss aur MOS deta hai.</li><li>Hamesha load mein test karo, idle link par kabhi nahi.</li></ul></div>`}};export{e as default};