var e={id:`measuring-paths`,h:{en:`How the edge measures path quality: BFD, buckets and poll intervals`,hi:`Edge path quality kaise measure karta hai: BFD, buckets aur poll intervals`},body:{en:`
<p>An SLA class is only a set of limits. To use it, the edge needs real numbers for every tunnel. Those numbers come from <b>BFD</b> (Bidirectional Forwarding Detection) packets that the WAN Edge sends inside each IPsec tunnel. If you understand exactly how those numbers are collected, you understand why AAR reacts the way it does, and why a "slow" policy is usually a timer problem.</p>

<h3>Analogy: the last six deliveries</h3>
<p>A food-delivery app rates a restaurant by averaging the <b>last six hours</b> of orders, one score per hour. A single bad lunch does not drop the rating at once, and a long bad spell takes hours to wash out of the average. BFD measurements work in a similar way: short measurement windows, called <b>buckets</b>, averaged over a few windows.</p>

<h3>BFD does two jobs</h3>
<ol>
<li><b>Liveness.</b> Hello packets are sent every <b>hello interval</b> (default 1000 ms). If no hello arrives for <b>multiplier</b> intervals (default 7), the tunnel is declared down. With defaults that is about 7 seconds.</li>
<li><b>Quality measurement.</b> The same hello stream is used to compute <b>loss</b> (hellos that did not come back), <b>latency</b> (from timestamps) and <b>jitter</b> (variation of the delay) for that tunnel.</li>
</ol>
<p>BFD runs between every pair of TLOCs that have a tunnel, in both directions, <b>inside the IPsec tunnel</b>. It is automatic. You do not turn it on, you only tune it.</p>

<h3>The timers</h3>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>Meaning</th></tr>
<tr><td>BFD <b>hello-interval</b> (per color)</td><td>1000 ms</td><td>How often a hello is sent</td></tr>
<tr><td>BFD <b>multiplier</b> (per color)</td><td>7</td><td>Missed hellos before the tunnel is declared down</td></tr>
<tr><td>app-route <b>poll-interval</b></td><td>600000 ms (10 minutes)</td><td>Length of one measurement bucket</td></tr>
<tr><td>app-route <b>multiplier</b></td><td>6</td><td>How many buckets are averaged to classify the tunnel</td></tr>
<tr><td>BFD <b>default-dscp</b></td><td>48</td><td>DSCP value in BFD packets (can be set per color)</td></tr></table>
<pre class="code"><span class="c">! IOS XE WAN Edge, tuned for faster reaction (values are examples)</span>
sdwan
 bfd color biz-internet
  hello-interval 1000
  multiplier 7
 bfd color mpls
  hello-interval 1000
  multiplier 7
 bfd app-route multiplier 5
 bfd app-route poll-interval 120000</pre>
<p>In Manager these live in the <b>System / BFD</b> feature template (or the equivalent configuration-group feature): basic settings for multiplier and poll interval, and a per-color list for hello interval and multiplier.</p>

<h3>The arithmetic that explains everything</h3>
<div class="eg"><p><b>Worked example.</b> Defaults: hello every 1 s, poll interval 10 minutes, multiplier 6. One bucket collects about <b>600 hellos</b>. Suppose the internet tunnel from E-BR1 to E-DC loses 24 hellos in the latest bucket: loss for that bucket = 24 / 600 = <b>4%</b>. The tunnel's reported loss is the <b>average of the last 6 buckets</b>: if the other five buckets had 0% loss, the average is 4 / 6 = <b>0.67%</b>, still under a 1% SLA. If the loss stays at 4% in every new bucket, the average passes 1% only when the second bad bucket arrives (4 x 2 / 6 = 1.33%), so voice stays on a bad tunnel for roughly 10 to 20 minutes.</p><p>With poll interval 120000 ms (2 minutes) and multiplier 5, one bucket has about 120 hellos, and the window is 10 minutes. Now 24 lost hellos in one bucket is 20% for that bucket and a 4% average: the SLA fails quickly. The price is that one short burst of loss can also flip the decision.</p></div>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Six measurement buckets averaged to classify a tunnel">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">Each bucket = one poll interval of BFD hellos</text>
<g font-size="12">
<rect x="40" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="80" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="130" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="170" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="220" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="260" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="310" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="350" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="400" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="440" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="490" y="60" width="80" height="60" rx="6" fill="#fed7aa"/><text x="530" y="95" text-anchor="middle" class="svg-ink">4% (new)</text>
</g>
<line x1="40" y1="140" x2="570" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="305" y="162" text-anchor="middle" class="svg-accent" font-size="13">average of 6 buckets = 0.67% loss</text>
<text x="305" y="184" text-anchor="middle" class="svg-muted" font-size="12">compared with the SLA class (for example loss 1%)</text>
</svg><p class="cap">One bad bucket is diluted by five good ones. Shorter windows react faster but are noisier.</p></div>

<h3>Reading the measurements</h3>
<pre class="out">E-BR1# show sdwan app-route stats remote-system-ip 10.255.0.1
app-route statistics 203.0.113.10 203.0.113.6 ipsec 12346 12346
 remote-system-ip         10.255.0.1
 local-color              biz-internet
 remote-color             biz-internet
 <span class="hl">mean-loss                0</span>
 <span class="hl">mean-latency             28</span>
 <span class="hl">mean-jitter              3</span>
 sla-class-index          0,1,2
                          TOTAL  AVERAGE  AVERAGE  TX DATA  RX DATA
 INDEX  PACKETS  LOSS  LATENCY  JITTER  PKTS     PKTS
 -----------------------------------------------------------------
 0      600      0     28       3       0        0
 1      600      0     27       2       0        0
 2      600      0     29       4       0        0</pre>
<p>Each row is one bucket; the <code>mean-*</code> lines are the averages used for the SLA decision. The line <code>sla-class-index</code> lists which SLA classes this tunnel currently <b>satisfies</b>. A tunnel that fails a class loses that index from the list.</p>
<pre class="out">E-BR1# show sdwan bfd sessions
SYSTEM IP    SITE ID  STATE  SRC COLOR     DST COLOR     SOURCE IP     DST PUBLIC IP  PORT   ENCAP  MULT  TX(ms)  UPTIME
10.255.0.1   100      up     biz-internet  biz-internet  203.0.113.10  203.0.113.6    12346  ipsec  7     1000    0:04:12:09
10.255.0.1   100      up     mpls          mpls          172.16.1.2    172.16.2.2     12346  ipsec  7     1000    0:04:12:07</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Shrinking the poll interval to a few seconds without shortening the hello interval, so each bucket has only a handful of packets and one lost packet looks like 20% loss, causing path flapping. (2) Setting different BFD hello timers on two ends and being surprised that one side is stricter. (3) Assuming an SLA violation is detected within a second; it is bounded by the poll interval and the averaging window.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <b>BFD multiplier</b> (default 7) decides when a tunnel is <i>down</i>. The <b>app-route multiplier</b> (default 6) decides how many buckets are averaged to compute <i>quality</i>. They are two different timers with similar names.</p></div>

<div class="scn"><h4>The brownout that took ten minutes to notice</h4><p>A hospital group in Bharat Retail's partner network reported that an ISP fault caused 6% loss on the internet tunnel from 9:00 to 9:25, yet AAR kept voice there for most of that time. The team checked the BFD timers and found the defaults: a 10-minute poll interval and a 6-bucket window. The first bucket with loss only raised the average slowly. They tested a 2-minute poll interval with a 5-bucket window on two branches, watched for flapping for a week, then rolled it out. The next brownout moved voice within about three minutes.</p><p><b>Lesson:</b> AAR speed is a timer decision. Tune poll interval and multiplier together, and test for flapping.</p></div>

<div class="iv"><p class="q">"How does a WAN Edge know that a tunnel has 3% loss?"</p><p>It sends BFD hellos inside the IPsec tunnel, one per hello interval, and counts those that do not come back. Loss, latency and jitter are collected in buckets of one app-route poll interval (default 10 minutes), and the last app-route multiplier buckets (default 6) are averaged and compared with the SLA class. Mention that BFD liveness uses a different multiplier (default 7) and that shortening timers speeds up reaction but risks flapping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BFD hellos inside each IPsec tunnel provide both liveness and loss, latency and jitter measurements.</li>
<li>Defaults: hello 1 s, BFD multiplier 7, app-route poll interval 10 minutes, app-route multiplier 6.</li>
<li>Quality = average of the last N buckets, so AAR reaction time depends on poll interval times multiplier.</li>
<li>Shorter timers react faster but risk flapping; keep enough hellos per bucket.</li>
<li>Check <code>show sdwan app-route stats</code> and <code>show sdwan bfd sessions</code>.</li>
</ul></div>
`,hi:`
<p>SLA class sirf limits ka ek set hai. Use karne ke liye edge ko har tunnel ke real numbers chahiye. Yeh numbers <b>BFD</b> (Bidirectional Forwarding Detection) packets se aate hain jo WAN Edge har IPsec tunnel ke andar bhejta hai. Jab aap samajh jaoge ki yeh numbers kaise collect hote hain, to samajh jaoge ki AAR aisa react kyun karta hai, aur "slow" policy aksar timer ki problem hoti hai.</p>

<h3>Analogy: aakhri chhe deliveries</h3>
<p>Food-delivery app restaurant ko pichhle <b>chhe ghante</b> ke orders ka average le kar rate karta hai, har ghante ka ek score. Ek kharab lunch se rating turant nahi girti, aur lambi kharab spell ko average se nikalne mein ghante lagte hain. BFD measurements bhi aise hi kaam karte hain: chhoti measurement windows, jinhe <b>buckets</b> kehte hain, kuch windows par average hoti hain.</p>

<h3>BFD do kaam karta hai</h3>
<ol>
<li><b>Liveness.</b> Hello packets har <b>hello interval</b> (default 1000 ms) par bheje jaate hain. Agar <b>multiplier</b> intervals (default 7) tak koi hello na aaye, tunnel down declare hota hai. Defaults ke saath yeh lagbhag 7 seconds hai.</li>
<li><b>Quality measurement.</b> Wahi hello stream us tunnel ka <b>loss</b> (jo hellos wapas nahi aaye), <b>latency</b> (timestamps se) aur <b>jitter</b> (delay ka variation) nikalne mein use hota hai.</li>
</ol>
<p>BFD har us TLOC pair ke beech chalta hai jinke beech tunnel hai, dono directions mein, <b>IPsec tunnel ke andar</b>. Yeh automatic hai. Aap ise on nahi karte, sirf tune karte ho.</p>

<h3>Timers</h3>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>Matlab</th></tr>
<tr><td>BFD <b>hello-interval</b> (per color)</td><td>1000 ms</td><td>Hello kitni der mein bheja jaata hai</td></tr>
<tr><td>BFD <b>multiplier</b> (per color)</td><td>7</td><td>Tunnel down declare hone se pehle kitne hellos miss hon</td></tr>
<tr><td>app-route <b>poll-interval</b></td><td>600000 ms (10 minutes)</td><td>Ek measurement bucket ki lambai</td></tr>
<tr><td>app-route <b>multiplier</b></td><td>6</td><td>Tunnel classify karne ke liye kitne buckets ka average liya jaata hai</td></tr>
<tr><td>BFD <b>default-dscp</b></td><td>48</td><td>BFD packets mein DSCP value (per color set ho sakti hai)</td></tr></table>
<pre class="code"><span class="c">! IOS XE WAN Edge, tuned for faster reaction (values are examples)</span>
sdwan
 bfd color biz-internet
  hello-interval 1000
  multiplier 7
 bfd color mpls
  hello-interval 1000
  multiplier 7
 bfd app-route multiplier 5
 bfd app-route poll-interval 120000</pre>
<p>Manager mein yeh <b>System / BFD</b> feature template (ya configuration-group ke equivalent feature) mein hote hain: multiplier aur poll interval ki basic settings, aur hello interval aur multiplier ki per-color list.</p>

<h3>Woh arithmetic jo sab kuch samjhata hai</h3>
<div class="eg"><p><b>Worked example.</b> Defaults: hello har 1 s, poll interval 10 minutes, multiplier 6. Ek bucket mein lagbhag <b>600 hellos</b> aate hain. Maan lo E-BR1 se E-DC ke internet tunnel ne latest bucket mein 24 hellos kho diye: us bucket ka loss = 24 / 600 = <b>4%</b>. Tunnel ka reported loss <b>pichhle 6 buckets ka average</b> hai: agar baaki paanch buckets mein 0% loss tha to average 4 / 6 = <b>0.67%</b> hai, jo 1% SLA ke neeche hai. Agar har naye bucket mein loss 4% hi rahe, to average 1% ko tab paar karta hai jab doosra kharab bucket aata hai (4 x 2 / 6 = 1.33%), isliye voice lagbhag 10 se 20 minute tak kharab tunnel par rehti hai.</p><p>Poll interval 120000 ms (2 minutes) aur multiplier 5 ke saath, ek bucket mein lagbhag 120 hellos hote hain, aur window 10 minutes ki hoti hai. Ab ek bucket mein 24 lost hellos us bucket ke liye 20% hain aur average 4%: SLA jaldi fail hota hai. Keemat yeh hai ki loss ka ek chhota burst bhi decision palat sakta hai.</p></div>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Tunnel classify karne ke liye chhe measurement buckets ka average">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">Har bucket = ek poll interval ke BFD hellos</text>
<g font-size="12">
<rect x="40" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="80" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="130" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="170" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="220" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="260" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="310" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="350" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="400" y="60" width="80" height="60" rx="6" fill="#bbf7d0"/><text x="440" y="95" text-anchor="middle" class="svg-ink">0%</text>
<rect x="490" y="60" width="80" height="60" rx="6" fill="#fed7aa"/><text x="530" y="95" text-anchor="middle" class="svg-ink">4% (naya)</text>
</g>
<line x1="40" y1="140" x2="570" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="305" y="162" text-anchor="middle" class="svg-accent" font-size="13">6 buckets ka average = 0.67% loss</text>
<text x="305" y="184" text-anchor="middle" class="svg-muted" font-size="12">SLA class se compare hota hai (jaise loss 1%)</text>
</svg><p class="cap">Ek kharab bucket paanch achchhe buckets mein ghul jaata hai. Chhoti windows jaldi react karti hain lekin zyada noisy hoti hain.</p></div>

<h3>Measurements padhna</h3>
<pre class="out">E-BR1# show sdwan app-route stats remote-system-ip 10.255.0.1
app-route statistics 203.0.113.10 203.0.113.6 ipsec 12346 12346
 remote-system-ip         10.255.0.1
 local-color              biz-internet
 remote-color             biz-internet
 <span class="hl">mean-loss                0</span>
 <span class="hl">mean-latency             28</span>
 <span class="hl">mean-jitter              3</span>
 sla-class-index          0,1,2
                          TOTAL  AVERAGE  AVERAGE  TX DATA  RX DATA
 INDEX  PACKETS  LOSS  LATENCY  JITTER  PKTS     PKTS
 -----------------------------------------------------------------
 0      600      0     28       3       0        0
 1      600      0     27       2       0        0
 2      600      0     29       4       0        0</pre>
<p>Har row ek bucket hai; <code>mean-*</code> lines woh averages hain jo SLA decision mein use hote hain. <code>sla-class-index</code> line batati hai ki yeh tunnel abhi kaunsi SLA classes ko <b>satisfy</b> karta hai. Jo tunnel koi class fail karta hai uska index list se hat jaata hai.</p>
<pre class="out">E-BR1# show sdwan bfd sessions
SYSTEM IP    SITE ID  STATE  SRC COLOR     DST COLOR     SOURCE IP     DST PUBLIC IP  PORT   ENCAP  MULT  TX(ms)  UPTIME
10.255.0.1   100      up     biz-internet  biz-internet  203.0.113.10  203.0.113.6    12346  ipsec  7     1000    0:04:12:09
10.255.0.1   100      up     mpls          mpls          172.16.1.2    172.16.2.2     12346  ipsec  7     1000    0:04:12:07</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Poll interval ko kuch seconds tak chhota kar dena bina hello interval chhota kiye, jisse har bucket mein sirf kuch packets hote hain aur ek lost packet 20% loss jaisa dikhta hai, path flapping hoti hai. (2) Do ends par alag BFD hello timers set karna aur is baat par hairaan hona ki ek side zyada strict hai. (3) Yeh maan lena ki SLA violation ek second mein detect ho jaata hai; woh poll interval aur averaging window se bounded hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>BFD multiplier</b> (default 7) tay karta hai ki tunnel kab <i>down</i> hai. <b>App-route multiplier</b> (default 6) tay karta hai ki <i>quality</i> nikalne ke liye kitne buckets ka average liya jaaye. Yeh do alag timers hain jinke naam milte-julte hain.</p></div>

<div class="scn"><h4>Brownout jo dus minute baad notice hua</h4><p>Bharat Retail ke partner network ke ek hospital group ne report kiya ki ISP fault se internet tunnel par 9:00 se 9:25 tak 6% loss tha, phir bhi AAR ne zyada tar samay voice wahin rakhi. Team ne BFD timers check kiye aur defaults mile: 10-minute poll interval aur 6-bucket window. Loss wale pehle bucket ne average ko sirf dheere se badhaya. Unhone do branches par 2-minute poll interval aur 5-bucket window test kiya, ek hafte flapping dekhi, phir roll out kiya. Agle brownout mein voice lagbhag teen minute mein move ho gayi.</p><p><b>Lesson:</b> AAR ki speed timer ka decision hai. Poll interval aur multiplier ko saath mein tune karo, aur flapping ke liye test karo.</p></div>

<div class="iv"><p class="q">"WAN Edge ko kaise pata chalta hai ki tunnel par 3% loss hai?"</p><p>Woh IPsec tunnel ke andar har hello interval par ek BFD hello bhejta hai aur gin-ta hai ki kitne wapas nahi aaye. Loss, latency aur jitter ek app-route poll interval (default 10 minutes) ke buckets mein collect hote hain, aur pichhle app-route multiplier buckets (default 6) ka average SLA class se compare hota hai. Batao ki BFD liveness alag multiplier (default 7) use karta hai aur timers chhote karne se reaction tez hota hai lekin flapping ka risk badhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har IPsec tunnel ke andar BFD hellos liveness aur loss, latency, jitter measurements dono dete hain.</li>
<li>Defaults: hello 1 s, BFD multiplier 7, app-route poll interval 10 minutes, app-route multiplier 6.</li>
<li>Quality = pichhle N buckets ka average, isliye AAR ka reaction time poll interval guna multiplier par depend karta hai.</li>
<li>Chhote timers tez react karte hain lekin flapping ka risk badhta hai; har bucket mein kaafi hellos rakho.</li>
<li><code>show sdwan app-route stats</code> aur <code>show sdwan bfd sessions</code> check karo.</li>
</ul></div>
`}};export{e as default};