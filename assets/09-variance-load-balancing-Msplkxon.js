var e={id:`variance`,h:{en:`Load balancing: equal cost and unequal cost with variance`,hi:`Load balancing: equal cost aur variance se unequal cost`},body:{en:`
<p>A taxi company in Pune has two roads to Mumbai: the expressway and an older highway that takes about twice as long. Sending every taxi on the expressway leaves the old highway idle; sending half the taxis on each road wastes time. The sensible plan is to send two taxis on the expressway for every one on the old road. EIGRP is the only common IGP that can do exactly this, using <b>unequal-cost load balancing</b>.</p>

<h3>Equal-cost load balancing</h3>
<p>By default EIGRP installs up to <b>4</b> paths with the <b>same</b> metric (<code>maximum-paths</code>, configurable up to 32 on current IOS). Traffic is then shared by CEF, normally per destination flow, so packets of one conversation stay on one path and do not arrive out of order.</p>

<h3>Unequal-cost load balancing with variance</h3>
<p>The <code>variance</code> command (1 to 128, default 1) is a multiplier. A path is installed alongside the successor when <b>both</b> rules hold:</p>
<ol>
<li>It is a <b>feasible successor</b>: its RD is less than the FD. This keeps load balancing loop-free.</li>
<li>Its metric is less than <b>variance x FD</b>.</li>
</ol>
<p>The number of installed paths is still limited by <code>maximum-paths</code>. Traffic is shared in inverse proportion to the metric: the better path gets more flows. <code>show ip route</code> shows a <b>traffic share count</b> for each path.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Lab 2 topology with two ISPs">
<rect x="20" y="118" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="140" text-anchor="middle" class="svg-ink" font-size="14">R1 Pune</text><text x="75" y="158" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.0/24</text>
<rect x="265" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">ISP-A</text>
<rect x="265" y="220" width="110" height="46" rx="8" fill="#fed7aa"/><text x="320" y="242" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="320" y="258" text-anchor="middle" class="svg-muted" font-size="12">ISP-B</text>
<rect x="510" y="118" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="140" text-anchor="middle" class="svg-ink" font-size="14">R4 Mumbai</text><text x="570" y="158" text-anchor="middle" class="svg-muted" font-size="12">172.16.4.0/24</text>
<line x1="130" y1="128" x2="265" y2="50" stroke="#64748b" stroke-width="3"/><text x="120" y="80" class="svg-muted" font-size="12">Gi0/0 10 us</text>
<line x1="130" y1="158" x2="265" y2="236" stroke="#64748b" stroke-width="3"/><text x="110" y="215" class="svg-accent" font-size="12">Gi0/1 delay 20 = 200 us</text>
<line x1="375" y1="50" x2="510" y2="128" stroke="#64748b" stroke-width="3"/><line x1="375" y1="236" x2="510" y2="158" stroke="#64748b" stroke-width="3"/>
<text x="460" y="80" class="svg-muted" font-size="12">10 us</text><text x="460" y="215" class="svg-muted" font-size="12">10 us</text>
</svg><p class="cap">Lab 2: every link is Gigabit; only R1's link to R3 carries extra delay.</p></div>

<div class="eg"><p><b>Worked example: lab 2, R1 to 172.16.4.0/24.</b> All links are 1 Gbps, so the bandwidth term is always 10.</p>
<ol>
<li><b>Via R2</b>: delays R1 Gi0/0 (10) + R2 Gi0/1 (10) + R4 Gi0/2 (10) = 30 microseconds = 3. Metric = 256 x (10 + 3) = <b>3328</b>. This is the successor, so <b>FD = 3328</b>.</li>
<li><b>Via R3</b>: R1 Gi0/1 has <code>delay 20</code> = 200 microseconds, plus R3 Gi0/1 (10) and R4 Gi0/2 (10) = 220 microseconds = 22. Metric = 256 x (10 + 22) = <b>8192</b>.</li>
<li><b>Is R3 a feasible successor?</b> R3's own distance: R3 Gi0/1 (10) + R4 Gi0/2 (10) = 2, so RD = 256 x 12 = <b>3072</b>. 3072 &lt; 3328: <b>yes</b>.</li>
<li><b>Smallest variance</b>: 8192 / 3328 = 2.46. Variance 2 gives 2 x 3328 = 6656, which is below 8192: not enough. Variance 3 gives 9984, which is above 8192: <b>variance 3</b> installs both paths.</li>
</ol></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! classic mode (lab 2)</span>
R1(config)# router eigrp 100
R1(config-router)# variance 3
R1(config-router)# maximum-paths 4      <span class="c">! default, shown for clarity</span>

<span class="c">! named mode equivalent</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 100
  topology base
   variance 3</pre>

<h3>Verification</h3>
<pre class="out">R1# show ip route 172.16.4.0
Routing entry for 172.16.4.0/24
  Known via "eigrp 100", distance 90, metric 3328, type internal
  Redistributing via eigrp 100
  Last update from 10.1.13.3 on GigabitEthernet0/1, 00:00:41 ago
  Routing Descriptor Blocks:
  * 10.1.12.2, from 10.1.12.2, 00:00:41 ago, via GigabitEthernet0/0
      <span class="hl">Route metric is 3328, traffic share count is 2</span>
      Total delay is 30 microseconds, minimum bandwidth is 1000000 Kbit
      Reliability 255/255, minimum MTU 1500 bytes
      Loading 1/255, Hops 2
    10.1.13.3, from 10.1.13.3, 00:00:41 ago, via GigabitEthernet0/1
      <span class="hl">Route metric is 8192, traffic share count is 1</span>
      Total delay is 220 microseconds, minimum bandwidth is 1000000 Kbit
      Reliability 255/255, minimum MTU 1500 bytes
      Loading 1/255, Hops 2</pre>
<p>The faster path through R2 carries about two flows for every one through R3, roughly the inverse of 3328 : 8192. Some IOS releases print larger share numbers, but the ratio is what matters. In <code>show ip route eigrp</code> the prefix now has two <code>via</code> lines.</p>

<div class="eg"><p><b>Worked example 2: variance applies to every prefix.</b> For R4's loopback 4.4.4.4/32 (loopback delay 5000 microseconds): via R2 = 256 x (10 + 1 + 1 + 500) = <b>131072</b> (FD); via R3 = 256 x (10 + 20 + 1 + 500) = <b>135936</b>; R3's RD = 256 x (10 + 1 + 500) = <b>130816</b>, below the FD, so R3 is an FS. 135936 is below 3 x 131072, so this prefix is also load-shared. That is the last check in lab 2.</p></div>

<h3>Controlling the share</h3>
<ul>
<li><code>traffic-share balanced</code> (default): share in inverse proportion to the metric.</li>
<li><code>traffic-share min across-interfaces</code>: install the extra paths but send traffic only on the best one. The others stay in the RIB, ready for instant use if the best path fails.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Raising variance to 128 and expecting a slow link to be used. If the path is not a feasible successor, no variance will ever install it. Check the RD in <code>show ip eigrp topology</code> before touching variance.</p></div>

<div class="exam"><p><b>Exam trap.</b> Both conditions are required: FS <b>and</b> metric below variance x FD. Variance changes the whole EIGRP process, not one prefix. OSPF has no unequal-cost load balancing; only equal-cost paths are shared.</p></div>

<div class="scn"><h4>The idle second ISP</h4><p>A branch in Pune paid for two Internet VPN links, but monitoring showed the second link at zero percent while the first was saturated at busy hours. The engineer found the second path in the topology table as a feasible successor with metric 8192 against an FD of 3328. A colleague had configured <code>variance 2</code>, which only reached 6656. Changing it to <code>variance 3</code> installed both paths with traffic shares 2 and 1, and peak-hour utilisation on the first link dropped by about a third.</p><p><b>Lesson:</b> always calculate: the metric of the extra path divided by the FD, rounded up, is the minimum variance.</p></div>

<div class="iv"><p class="q">"FD is 3328 and a second path has metric 8192 with RD 3072. What must you configure to use both, and how will traffic be split?"</p><p>Strong answer: first confirm it is a feasible successor, 3072 &lt; 3328, so yes. Then 8192 / 3328 is about 2.46, so variance 3 is the smallest value that works; 2 would give only 6656. Traffic will be shared in inverse proportion to metric, about two flows through the better path for each one through the slower path, per flow with CEF. Mention that OSPF cannot do this.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP installs up to 4 equal-cost paths by default (<code>maximum-paths</code>).</li>
<li><code>variance N</code> adds a path if it is an FS and its metric is less than N x FD.</li>
<li>Minimum variance = extra path metric / FD, rounded up (8192 / 3328 gives 3).</li>
<li>Traffic is shared in inverse proportion to metric; check the traffic share count in <code>show ip route</code>.</li>
<li>Unequal-cost load balancing is unique to EIGRP among common IGPs.</li>
</ul></div>
`,hi:`
<p>Pune ki ek taxi company ke paas Mumbai jaane ke do raaste hain: expressway aur ek purana highway jisme lagbhag dugna time lagta hai. Har taxi ko expressway par bhejne se purana highway khaali rehta hai; aadhi taxis har road par bhejne se time barbaad hota hai. Samajhdaar plan hai ki purani road par ek taxi ke badle expressway par do taxis bhejo. Common IGPs mein sirf EIGRP yeh bilkul kar sakta hai, <b>unequal-cost load balancing</b> se.</p>

<h3>Equal-cost load balancing</h3>
<p>Default mein EIGRP <b>same</b> metric wale <b>4</b> tak paths install karta hai (<code>maximum-paths</code>, current IOS par 32 tak configurable). Phir traffic CEF baant-ta hai, normally per destination flow, isliye ek conversation ke packets ek hi path par rehte hain aur out of order nahi pahunchte.</p>

<h3>Variance se unequal-cost load balancing</h3>
<p><code>variance</code> command (1 se 128, default 1) ek multiplier hai. Koi path successor ke saath tab install hota hai jab <b>dono</b> rules poore hon:</p>
<ol>
<li>Woh <b>feasible successor</b> ho: uska RD FD se kam ho. Isse load balancing loop-free rehta hai.</li>
<li>Uska metric <b>variance x FD</b> se kam ho.</li>
</ol>
<p>Installed paths ki sankhya ab bhi <code>maximum-paths</code> se limited hai. Traffic metric ke ulte anupaat mein baant-ta hai: behtar path ko zyada flows milte hain. <code>show ip route</code> har path ka <b>traffic share count</b> dikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Do ISPs wali lab 2 topology">
<rect x="20" y="118" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="140" text-anchor="middle" class="svg-ink" font-size="14">R1 Pune</text><text x="75" y="158" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.0/24</text>
<rect x="265" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">ISP-A</text>
<rect x="265" y="220" width="110" height="46" rx="8" fill="#fed7aa"/><text x="320" y="242" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="320" y="258" text-anchor="middle" class="svg-muted" font-size="12">ISP-B</text>
<rect x="510" y="118" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="140" text-anchor="middle" class="svg-ink" font-size="14">R4 Mumbai</text><text x="570" y="158" text-anchor="middle" class="svg-muted" font-size="12">172.16.4.0/24</text>
<line x1="130" y1="128" x2="265" y2="50" stroke="#64748b" stroke-width="3"/><text x="120" y="80" class="svg-muted" font-size="12">Gi0/0 10 us</text>
<line x1="130" y1="158" x2="265" y2="236" stroke="#64748b" stroke-width="3"/><text x="110" y="215" class="svg-accent" font-size="12">Gi0/1 delay 20 = 200 us</text>
<line x1="375" y1="50" x2="510" y2="128" stroke="#64748b" stroke-width="3"/><line x1="375" y1="236" x2="510" y2="158" stroke="#64748b" stroke-width="3"/>
<text x="460" y="80" class="svg-muted" font-size="12">10 us</text><text x="460" y="215" class="svg-muted" font-size="12">10 us</text>
</svg><p class="cap">Lab 2: har link Gigabit hai; sirf R1 ke R3 wale link par extra delay hai.</p></div>

<div class="eg"><p><b>Worked example: lab 2, R1 se 172.16.4.0/24.</b> Saare links 1 Gbps hain, isliye bandwidth term hamesha 10 hai.</p>
<ol>
<li><b>R2 ke through</b>: delays R1 Gi0/0 (10) + R2 Gi0/1 (10) + R4 Gi0/2 (10) = 30 microseconds = 3. Metric = 256 x (10 + 3) = <b>3328</b>. Yeh successor hai, isliye <b>FD = 3328</b>.</li>
<li><b>R3 ke through</b>: R1 Gi0/1 par <code>delay 20</code> = 200 microseconds, plus R3 Gi0/1 (10) aur R4 Gi0/2 (10) = 220 microseconds = 22. Metric = 256 x (10 + 22) = <b>8192</b>.</li>
<li><b>Kya R3 feasible successor hai?</b> R3 ka apna distance: R3 Gi0/1 (10) + R4 Gi0/2 (10) = 2, isliye RD = 256 x 12 = <b>3072</b>. 3072 &lt; 3328: <b>haan</b>.</li>
<li><b>Sabse chhota variance</b>: 8192 / 3328 = 2.46. Variance 2 deta hai 2 x 3328 = 6656, jo 8192 se kam hai: kaafi nahi. Variance 3 deta hai 9984, jo 8192 se upar hai: <b>variance 3</b> dono paths install karta hai.</li>
</ol></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! classic mode (lab 2)</span>
R1(config)# router eigrp 100
R1(config-router)# variance 3
R1(config-router)# maximum-paths 4      <span class="c">! default, clarity ke liye dikhaya</span>

<span class="c">! named mode equivalent</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 100
  topology base
   variance 3</pre>

<h3>Verification</h3>
<pre class="out">R1# show ip route 172.16.4.0
Routing entry for 172.16.4.0/24
  Known via "eigrp 100", distance 90, metric 3328, type internal
  Redistributing via eigrp 100
  Last update from 10.1.13.3 on GigabitEthernet0/1, 00:00:41 ago
  Routing Descriptor Blocks:
  * 10.1.12.2, from 10.1.12.2, 00:00:41 ago, via GigabitEthernet0/0
      <span class="hl">Route metric is 3328, traffic share count is 2</span>
      Total delay is 30 microseconds, minimum bandwidth is 1000000 Kbit
      Reliability 255/255, minimum MTU 1500 bytes
      Loading 1/255, Hops 2
    10.1.13.3, from 10.1.13.3, 00:00:41 ago, via GigabitEthernet0/1
      <span class="hl">Route metric is 8192, traffic share count is 1</span>
      Total delay is 220 microseconds, minimum bandwidth is 1000000 Kbit
      Reliability 255/255, minimum MTU 1500 bytes
      Loading 1/255, Hops 2</pre>
<p>R2 wala fast path R3 wale har ek flow ke badle lagbhag do flows le jaata hai, jo lagbhag 3328 : 8192 ka ulta hai. Kuch IOS releases bade share numbers print karti hain, lekin ratio hi matter karta hai. <code>show ip route eigrp</code> mein ab prefix ki do <code>via</code> lines hain.</p>

<div class="eg"><p><b>Worked example 2: variance har prefix par lagta hai.</b> R4 ke loopback 4.4.4.4/32 ke liye (loopback delay 5000 microseconds): R2 ke through = 256 x (10 + 1 + 1 + 500) = <b>131072</b> (FD); R3 ke through = 256 x (10 + 20 + 1 + 500) = <b>135936</b>; R3 ka RD = 256 x (10 + 1 + 500) = <b>130816</b>, FD se kam, isliye R3 FS hai. 135936, 3 x 131072 se kam hai, isliye yeh prefix bhi load-share hota hai. Lab 2 ka aakhri check yahi hai.</p></div>

<h3>Share ko control karna</h3>
<ul>
<li><code>traffic-share balanced</code> (default): metric ke ulte anupaat mein share.</li>
<li><code>traffic-share min across-interfaces</code>: extra paths install karo lekin traffic sirf best par bhejo. Baaki RIB mein rehte hain, best path fail hone par turant use ke liye ready.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Variance 128 tak badhana aur umeed karna ki slow link use hoga. Agar path feasible successor nahi hai, to koi bhi variance use kabhi install nahi karega. Variance chhune se pehle <code>show ip eigrp topology</code> mein RD check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Dono conditions zaroori hain: FS <b>aur</b> metric variance x FD se kam. Variance poore EIGRP process ko badalta hai, ek prefix ko nahi. OSPF mein unequal-cost load balancing nahi hai; sirf equal-cost paths share hote hain.</p></div>

<div class="scn"><h4>Khaali baitha doosra ISP</h4><p>Pune ki ek branch do Internet VPN links ke paise de rahi thi, lekin monitoring mein doosra link zero percent par tha jabki pehla busy hours mein saturated tha. Engineer ko doosra path topology table mein 3328 ke FD ke against 8192 metric wala feasible successor mila. Ek colleague ne <code>variance 2</code> configure kiya tha, jo sirf 6656 tak pahunchta tha. Ise <code>variance 3</code> karne se dono paths traffic shares 2 aur 1 ke saath install ho gaye, aur peak-hour mein pehle link ka utilisation lagbhag ek-tihaai kam ho gaya.</p><p><b>Seekh:</b> hamesha calculate karo: extra path ka metric divided by FD, upar round kiya hua, minimum variance hai.</p></div>

<div class="iv"><p class="q">"FD 3328 hai aur doosre path ka metric 8192, RD 3072 hai. Dono use karne ke liye kya configure karoge, aur traffic kaise bategaa?"</p><p>Strong answer: pehle confirm karo ki yeh feasible successor hai, 3072 &lt; 3328, to haan. Phir 8192 / 3328 lagbhag 2.46 hai, isliye variance 3 sabse chhoti kaam karne wali value hai; 2 sirf 6656 deta. Traffic metric ke ulte anupaat mein bategaa, behtar path se lagbhag do flows har ek slow path wale flow ke badle, CEF ke saath per flow. Batao ki OSPF yeh nahi kar sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EIGRP default mein 4 tak equal-cost paths install karta hai (<code>maximum-paths</code>).</li>
<li><code>variance N</code> path jodta hai agar woh FS ho aur uska metric N x FD se kam ho.</li>
<li>Minimum variance = extra path ka metric / FD, upar round kiya hua (8192 / 3328 se 3).</li>
<li>Traffic metric ke ulte anupaat mein baant-ta hai; <code>show ip route</code> mein traffic share count check karo.</li>
<li>Common IGPs mein unequal-cost load balancing sirf EIGRP mein hai.</li>
</ul></div>
`}};export{e as default};