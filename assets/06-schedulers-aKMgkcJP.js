var e={id:`schedulers`,h:{en:`Schedulers, shaping and drop profiles`,hi:`Schedulers, shaping aur drop profiles`},body:{en:`
<p>Classification puts a packet in a queue. A <b>scheduler</b> decides how that queue is served when the egress link cannot carry everything at once. This is where CoS finally changes the outcome for voice and for backups.</p>

<h3>The building blocks</h3>
<ul>
<li><b>Scheduler</b>: the rules for one queue (guaranteed rate, priority, buffer, optional ceiling, drop profiles).</li>
<li><b>Scheduler-map</b>: a table that binds each forwarding class to a scheduler.</li>
<li><b>Interface binding</b>: the scheduler-map is applied to the <b>physical</b> interface (<code>class-of-service interfaces ge-0/0/0 scheduler-map NAME</code>).</li>
</ul>
<table class="cmp"><tr><th>Statement</th><th>Meaning</th></tr>
<tr><td><code>transmit-rate</code></td><td>Guaranteed share: a rate, a <code>percent</code>, or <code>remainder</code>. Adding <code>exact</code> also caps it</td></tr>
<tr><td><code>priority strict-high</code></td><td>Always served first. Meant for voice; protect other queues by limiting it</td></tr>
<tr><td><code>priority high / low</code></td><td>Who goes first among queues that are within their guaranteed rate</td></tr>
<tr><td><code>buffer-size</code></td><td>Share of the delay buffer; small for voice means low latency</td></tr>
<tr><td><code>shaping-rate</code></td><td>On a scheduler: queue ceiling. On the interface: the whole port is slowed to this rate</td></tr></table>

<h3>First, the problem without a scheduler-map</h3>
<p>At the Surat clinic, EDGE shapes its gigabit port ge-0/0/0 to 2 Mbps. Phones mark voice as EF and the classifier is correct, but no scheduler-map exists. The default map serves only best-effort (95 percent) and network-control (5 percent). We run a 400 kbps call and a 3 Mbps backup together:</p>
<pre class="out">VOIPPC&gt; traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.99.0.10         udp/30000  46    400      10/10 2500      250        <span class="hl">90.0%</span>

lab@EDGE&gt; show interfaces queue ge-0/0/0
  Shaping rate: 2000000 bps
Queue: 0, Forwarding classes: best-effort
  Queued:
    Packets              :                  2680                    54 pps
  Transmitted:
    Packets              :                  1780                    36 pps
    Tail-dropped packets :                   900                    18 pps
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    Packets              :                  2500                    50 pps
  Transmitted:
    <span class="hl">Packets              :                   250                     0 pps
    Tail-dropped packets :                  2241                    50 pps</span></pre>
<p>(Output trimmed to packet lines.) Voice, the class that matters most, lost 90 percent while the backup lost only a third. The default schedulers give expedited-forwarding nothing, so the queue is starved.</p>

<h3>The fix: a scheduler-map with strict-high voice</h3>
<pre class="code"><span class="c"># config on EDGE</span>
set class-of-service schedulers S-VOICE transmit-rate percent 25
set class-of-service schedulers S-VOICE priority strict-high
set class-of-service schedulers S-DATA transmit-rate remainder
set class-of-service schedulers S-CONTROL transmit-rate percent 5
set class-of-service scheduler-maps SM-WAN forwarding-class expedited-forwarding scheduler S-VOICE
set class-of-service scheduler-maps SM-WAN forwarding-class best-effort scheduler S-DATA
set class-of-service scheduler-maps SM-WAN forwarding-class network-control scheduler S-CONTROL
set class-of-service interfaces ge-0/0/0 scheduler-map SM-WAN
commit</pre>
<p>Run the same test again after <code>clear interfaces statistics ge-0/0/0</code>:</p>
<pre class="out">VOIPPC&gt; traffic show
1   10.99.0.10         udp/30000  46    400      10/10 2500      2500       <span class="hl">0.0%</span>

NAS&gt; traffic show
1   10.99.0.10         tcp/5001   0     3000     10/10 2680      1430       46.6%

lab@EDGE&gt; show class-of-service interface ge-0/0/0
  Shaping rate: 2000000 bps
  <span class="hl">Scheduler map: SM-WAN, Index: 54030</span></pre>
<p>Voice now has zero drops and the backup takes all the loss. Total demand was 3.4 Mbps on 2 Mbps, so something had to give; the scheduler decided that it would be the backup.</p>

<h3>Reading the scheduler-map</h3>
<pre class="out">lab@EDGE&gt; show class-of-service scheduler-map SM-WAN
Scheduler map: SM-WAN, Index: 54030

  Scheduler: S-VOICE, Forwarding class: expedited-forwarding, Index: 32969
    Transmit rate: 25 percent, Rate Limit: none, Buffer size: remainder, Buffer Limit: none, <span class="hl">Priority: strict-high</span>
  Scheduler: S-DATA, Forwarding class: best-effort, Index: 29061
    Transmit rate: remainder, Rate Limit: none, Buffer size: remainder, Buffer Limit: none, Priority: low
  Scheduler: S-CONTROL, Forwarding class: network-control, Index: 19950
    Transmit rate: 5 percent, Rate Limit: none, Buffer size: remainder, Buffer Limit: none, Priority: low</pre>
<p>(Drop-profile tables omitted.) A strict-high queue is always served before the others, which gives voice the lowest delay. The risk is that an unlimited strict-high queue can take the whole link and starve everything else. Production designs limit it with <code>transmit-rate ... exact</code>, a scheduler <code>shaping-rate</code>, or an upstream policer. The exact behaviour of strict-high and its rate depends on the platform, so check the platform guide before you rely on it.</p>

<h3>Shaping</h3>
<p><code>shaping-rate 2m</code> on the physical interface makes a gigabit port behave like a 2 Mbps circuit. Without it the port transmits at line rate, nothing queues locally and the congestion happens in the provider's equipment, where you have no control. Shape to the circuit speed so your scheduler becomes the bottleneck.</p>

<h3>Drop profiles and RED</h3>
<p>Tail drop discards packets only when a queue is completely full. <b>Random early detection (RED)</b> starts discarding earlier, with a probability that rises as the queue fills, and it can do this by <b>loss priority</b>. A drop profile is a curve of <code>fill-level</code> against <code>drop-probability</code>:</p>
<pre class="code"><span class="c"># config: packets with high loss priority start dying at 30 percent fill</span>
set class-of-service drop-profiles DP-HIGH interpolate fill-level [ 30 60 ] drop-probability [ 20 100 ]
set class-of-service schedulers S-DATA drop-profile-map loss-priority high protocol any drop-profile DP-HIGH</pre>
<pre class="out">lab@EDGE&gt; show class-of-service drop-profile
Drop profile: &lt;default-drop-profile&gt;, Type: discrete, Index: 1
  Fill level    Drop probability
         100                 100
Drop profile: DP-HIGH, Type: interpolated, Index: 33432
  Fill level    Drop probability
          30                  20
          60                 100</pre>
<p>The default profile drops 100 percent only at 100 percent fill, which is tail drop. DP-HIGH says: from 30 percent fill drop 20 percent of high-loss-priority packets, rising to 100 percent at 60 percent fill. Low-priority packets still use the default profile. This is how a soft policer from chapter 5 pays off: the out-of-profile packets marked high die first.</p>

<div class="eg"><p><b>Worked example.</b> With S-VOICE at 25 percent of 2 Mbps, the guaranteed rate is 500 kbps. The call uses 400 kbps, which fits. S-DATA with <code>remainder</code> receives the rest of the 2 Mbps. The backup demands 3 Mbps, so it gets about 1.6 Mbps and drops the difference: 1,430 of 2,680 packets delivered, which matches the 46.6 percent loss in the output above.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Applying the scheduler-map to a logical unit instead of the physical interface. (2) Forgetting to list a forwarding class in the map; unmapped classes use the default scheduler. (3) Percentages that add to more than 100. (4) Shaping on the wrong end of the link.</p></div>
<div class="exam"><p><b>Exam trap.</b> Without a scheduler-map the default gives best-effort 95 percent and network-control 5 percent, with nothing for EF or AF. Another favourite: <code>transmit-rate remainder</code> means "whatever the other queues leave".</p></div>

<div class="scn"><h4>Voice dropped while the link showed 40 percent use</h4><p>Utilisation graphs on the 2 Mbps clinic circuit looked healthy, yet audio broke every time the NAS replicated. The queue counters showed thousands of tail drops in queue 1, the voice queue. The engineer added a strict-high scheduler for the voice class. On the next replication run voice counters showed zero drops.</p><p><b>Lesson:</b> trust queue counters, apply the scheduler-map to the physical port, and give voice a priority scheduler.</p></div>

<div class="iv"><p class="q">"How do you guarantee voice quality on a congested WAN link?"</p><p>I classify voice into expedited-forwarding, build a scheduler with strict-high priority and a limited transmit rate, put it in a scheduler-map with a scheduler for every class in use, apply the map to the physical interface, and shape the interface to the circuit speed. I verify with <code>show interfaces queue</code> that queue 1 has no tail drops under load.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scheduler-map binds forwarding classes to schedulers; apply it to the physical interface.</li>
<li>Default map: best-effort 95, network-control 5, nothing for EF or AF.</li>
<li>strict-high is served first; limit it so it cannot starve other queues.</li>
<li>Interface <code>shaping-rate</code> makes your router the bottleneck.</li>
<li>Drop profiles drop early by loss priority; verify with <code>show interfaces queue</code>.</li>
</ul></div>
`,hi:`
<p>Classification packet ko queue mein daalta hai. <b>Scheduler</b> tay karta hai ki jab egress link ek saath sab kuch nahi le jaa sakta tab us queue ko kaise serve kiya jaaye. Yahin CoS aakhirkar voice aur backups ka nateeja badalta hai.</p>

<h3>Building blocks</h3>
<ul>
<li><b>Scheduler</b>: ek queue ke rules (guaranteed rate, priority, buffer, optional ceiling, drop profiles).</li>
<li><b>Scheduler-map</b>: table jo har forwarding class ko ek scheduler se jodti hai.</li>
<li><b>Interface binding</b>: scheduler-map <b>physical</b> interface par lagta hai (<code>class-of-service interfaces ge-0/0/0 scheduler-map NAME</code>).</li>
</ul>
<table class="cmp"><tr><th>Statement</th><th>Matlab</th></tr>
<tr><td><code>transmit-rate</code></td><td>Guaranteed hissa: rate, <code>percent</code>, ya <code>remainder</code>. <code>exact</code> jodne se woh cap bhi ban jaata hai</td></tr>
<tr><td><code>priority strict-high</code></td><td>Hamesha pehle serve. Voice ke liye; baaki queues ko bachane ke liye ise limit karo</td></tr>
<tr><td><code>priority high / low</code></td><td>Guaranteed rate ke andar wali queues mein pehle kaun jaaye</td></tr>
<tr><td><code>buffer-size</code></td><td>Delay buffer ka hissa; voice ke liye chhota matlab kam latency</td></tr>
<tr><td><code>shaping-rate</code></td><td>Scheduler par: queue ki chhat. Interface par: poora port is rate tak dheema ho jaata hai</td></tr></table>

<h3>Pehle, scheduler-map ke bina problem</h3>
<p>Surat clinic mein EDGE apna gigabit port ge-0/0/0 2 Mbps par shape karta hai. Phones voice ko EF mark karte hain aur classifier sahi hai, lekin scheduler-map nahi hai. Default map sirf best-effort (95 percent) aur network-control (5 percent) ko serve karta hai. Hum 400 kbps ki call aur 3 Mbps ka backup ek saath chalate hain:</p>
<pre class="out">VOIPPC&gt; traffic show
ID  Destination        Proto      DSCP  kbps     Time  Sent      Delivered  Loss
1   10.99.0.10         udp/30000  46    400      10/10 2500      250        <span class="hl">90.0%</span>

lab@EDGE&gt; show interfaces queue ge-0/0/0
  Shaping rate: 2000000 bps
Queue: 0, Forwarding classes: best-effort
  Queued:
    Packets              :                  2680                    54 pps
  Transmitted:
    Packets              :                  1780                    36 pps
    Tail-dropped packets :                   900                    18 pps
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    Packets              :                  2500                    50 pps
  Transmitted:
    <span class="hl">Packets              :                   250                     0 pps
    Tail-dropped packets :                  2241                    50 pps</span></pre>
<p>(Output packet lines tak trim kiya gaya.) Voice, jo sabse zaroori class hai, ka 90 percent loss hua jabki backup ka sirf ek tihai. Default schedulers expedited-forwarding ko kuch nahi dete, isliye queue bhookhi rehti hai.</p>

<h3>Fix: strict-high voice wala scheduler-map</h3>
<pre class="code"><span class="c"># config EDGE par</span>
set class-of-service schedulers S-VOICE transmit-rate percent 25
set class-of-service schedulers S-VOICE priority strict-high
set class-of-service schedulers S-DATA transmit-rate remainder
set class-of-service schedulers S-CONTROL transmit-rate percent 5
set class-of-service scheduler-maps SM-WAN forwarding-class expedited-forwarding scheduler S-VOICE
set class-of-service scheduler-maps SM-WAN forwarding-class best-effort scheduler S-DATA
set class-of-service scheduler-maps SM-WAN forwarding-class network-control scheduler S-CONTROL
set class-of-service interfaces ge-0/0/0 scheduler-map SM-WAN
commit</pre>
<p><code>clear interfaces statistics ge-0/0/0</code> ke baad wahi test dobara chalao:</p>
<pre class="out">VOIPPC&gt; traffic show
1   10.99.0.10         udp/30000  46    400      10/10 2500      2500       <span class="hl">0.0%</span>

NAS&gt; traffic show
1   10.99.0.10         tcp/5001   0     3000     10/10 2680      1430       46.6%

lab@EDGE&gt; show class-of-service interface ge-0/0/0
  Shaping rate: 2000000 bps
  <span class="hl">Scheduler map: SM-WAN, Index: 54030</span></pre>
<p>Ab voice mein zero drops hain aur saara loss backup ka hai. Kul demand 2 Mbps par 3.4 Mbps thi, kisi ko to jhukna tha; scheduler ne tay kiya ki backup jhukega.</p>

<h3>Scheduler-map padhna</h3>
<pre class="out">lab@EDGE&gt; show class-of-service scheduler-map SM-WAN
Scheduler map: SM-WAN, Index: 54030

  Scheduler: S-VOICE, Forwarding class: expedited-forwarding, Index: 32969
    Transmit rate: 25 percent, Rate Limit: none, Buffer size: remainder, Buffer Limit: none, <span class="hl">Priority: strict-high</span>
  Scheduler: S-DATA, Forwarding class: best-effort, Index: 29061
    Transmit rate: remainder, Rate Limit: none, Buffer size: remainder, Buffer Limit: none, Priority: low
  Scheduler: S-CONTROL, Forwarding class: network-control, Index: 19950
    Transmit rate: 5 percent, Rate Limit: none, Buffer size: remainder, Buffer Limit: none, Priority: low</pre>
<p>(Drop-profile tables hata di gayi.) Strict-high queue baaki sab se pehle serve hoti hai, isliye voice ko sabse kam delay milta hai. Risk yeh hai ki bina limit wali strict-high queue poora link le kar baaki sab ko bhookha rakh sakti hai. Production designs ise <code>transmit-rate ... exact</code>, scheduler <code>shaping-rate</code> ya upstream policer se limit karte hain. Strict-high aur uske rate ka exact behaviour platform par depend karta hai, isliye bharosa karne se pehle platform guide dekho.</p>

<h3>Shaping</h3>
<p>Physical interface par <code>shaping-rate 2m</code> gigabit port ko 2 Mbps circuit jaisa bana deta hai. Iske bina port line rate par bhejta hai, local queue nahi banti aur congestion provider ke equipment mein hota hai jahan aapka koi control nahi. Circuit speed par shape karo taaki aapka scheduler hi bottleneck bane.</p>

<h3>Drop profiles aur RED</h3>
<p>Tail drop packets tabhi girata hai jab queue poori bhar jaaye. <b>Random early detection (RED)</b> pehle se girana shuru karta hai, aisi probability ke saath jo queue bharne par badhti hai, aur yeh <b>loss priority</b> ke hisaab se kar sakta hai. Drop profile <code>fill-level</code> aur <code>drop-probability</code> ka curve hai:</p>
<pre class="code"><span class="c"># config: high loss priority wale packets 30 percent fill par marna shuru karte hain</span>
set class-of-service drop-profiles DP-HIGH interpolate fill-level [ 30 60 ] drop-probability [ 20 100 ]
set class-of-service schedulers S-DATA drop-profile-map loss-priority high protocol any drop-profile DP-HIGH</pre>
<pre class="out">lab@EDGE&gt; show class-of-service drop-profile
Drop profile: &lt;default-drop-profile&gt;, Type: discrete, Index: 1
  Fill level    Drop probability
         100                 100
Drop profile: DP-HIGH, Type: interpolated, Index: 33432
  Fill level    Drop probability
          30                  20
          60                 100</pre>
<p>Default profile 100 percent drop sirf 100 percent fill par karta hai, yaani tail drop. DP-HIGH kehta hai: 30 percent fill se high-loss-priority packets ka 20 percent girao, jo 60 percent fill par 100 percent ho jaata hai. Low-priority packets abhi bhi default profile use karte hain. Chapter 5 ka soft policer yahin kaam aata hai: high mark hue out-of-profile packets sabse pehle marte hain.</p>

<div class="eg"><p><b>Worked example.</b> S-VOICE 2 Mbps ka 25 percent hai, yaani guaranteed rate 500 kbps. Call 400 kbps use karti hai, jo fit hoti hai. <code>remainder</code> wala S-DATA 2 Mbps ka baaki hissa leta hai. Backup 3 Mbps maangta hai, isliye use lagbhag 1.6 Mbps milta hai aur farq drop hota hai: 2,680 mein se 1,430 packets delivered, jo upar ke output ke 46.6 percent loss se match karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Scheduler-map ko physical interface ki jagah logical unit par lagana. (2) Map mein koi forwarding class list karna bhool jaana; unmapped classes default scheduler use karti hain. (3) Percentages ka 100 se zyada jodna. (4) Link ke galat end par shaping.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scheduler-map ke bina default best-effort ko 95 percent aur network-control ko 5 percent deta hai, EF ya AF ke liye kuch nahi. Ek aur pasandida: <code>transmit-rate remainder</code> ka matlab "baaki queues jo chhodein woh".</p></div>

<div class="scn"><h4>Link 40 percent use par tha phir bhi voice toot gayi</h4><p>2 Mbps clinic circuit ke utilisation graphs theek dikhte the, phir bhi NAS replicate hote hi audio toot jaata tha. Queue counters ne voice queue, yaani queue 1, mein hazaron tail drops dikhaye. Engineer ne voice class ke liye strict-high scheduler jod diya. Agli replication run mein voice counters mein zero drops the.</p><p><b>Lesson:</b> queue counters par bharosa karo, scheduler-map physical port par lagao, aur voice ko priority scheduler do.</p></div>

<div class="iv"><p class="q">"Congested WAN link par voice quality kaise guarantee karte ho?"</p><p>Main voice ko expedited-forwarding mein classify karta hoon, strict-high priority aur limited transmit rate wala scheduler banata hoon, use scheduler-map mein har use hone wali class ke scheduler ke saath rakhta hoon, map ko physical interface par lagata hoon, aur interface ko circuit speed par shape karta hoon. <code>show interfaces queue</code> se verify karta hoon ki load mein queue 1 mein tail drops nahi hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scheduler-map forwarding classes ko schedulers se jodta hai; physical interface par lagao.</li>
<li>Default map: best-effort 95, network-control 5, EF ya AF ke liye kuch nahi.</li>
<li>strict-high pehle serve hoti hai; use limit karo taaki baaki queues bhookhi na rahein.</li>
<li>Interface <code>shaping-rate</code> aapke router ko bottleneck banata hai.</li>
<li>Drop profiles loss priority ke hisaab se pehle girate hain; <code>show interfaces queue</code> se verify karo.</li>
</ul></div>
`}};export{e as default};