var e={id:`keepalives`,h:{en:`GRE keepalives: noticing a dead far end`,hi:`GRE keepalives: mara hua far end pakadna`},body:{en:`
<p>Here is a surprising fact: a tunnel interface has no cable. There is no light on a fibre, no electrical signal to lose. So how does the router know the far end is alive? By default it does not. This chapter explains the problem and the Junos solution, GRE keepalives.</p>

<h3>The problem: Up does not mean working</h3>
<p>A GRE or IP-IP unit comes up when the tunnel destination is <b>routable</b>. In our lab R1 has a default route towards the ISP, so 203.0.113.9 is always routable, even if R3 is powered off, unplugged or misconfigured. The tunnel stays Up and R1 keeps sending traffic into a black hole. OSPF would eventually notice (its dead timer is 40 seconds on a point-to-point link by default), but static routes through the tunnel would never notice at all.</p>
<p>What we want is a small heartbeat: R1 asks "are you there?", R3 answers, and if the answers stop for long enough the tunnel is declared down so that routes over it are withdrawn and a backup path can take over.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="GRE keepalive exchange">
<rect x="30" y="40" width="120" height="100" rx="10" fill="#bbf7d0"/><text x="90" y="95" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="490" y="40" width="120" height="100" rx="10" fill="#bbf7d0"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="150" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">keepalive (every 5 s)</text>
<line x1="490" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">reflected back by the far end</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">No reply for the hold time (15 s): R1 marks the tunnel down</text>
</svg><p class="cap">R1 sends a small GRE packet; the far end sends it back. Silence for the hold time means down.</p></div>

<h3>How GRE keepalives work</h3>
<p>The router builds a keepalive packet that is addressed back to itself, wraps it in GRE towards the far end, and sends it. The far router does not need to understand it: it simply decapsulates, sees a packet destined for the sender, and routes it back through its own tunnel. When the reply arrives, the sender knows the whole round trip works. This is why keepalives test <b>both directions</b> of the path and the far router's tunnel, not just reachability of an address.</p>

<h3>Configuration</h3>
<p>Keepalives sit under the OAM (operations, administration and maintenance) hierarchy, not under the interface:</p>
<pre class="code"><span class="c">! on both R1 and R3: one keepalive every 5 s, dead after 15 s</span>
set protocols oam gre-tunnel interface gr-0/0/0.0 keepalive-time 5 hold-time 15
commit</pre>
<ul>
<li><b>keepalive-time</b> is the interval between probes, in seconds.</li>
<li><b>hold-time</b> is how long the router waits without any reply before it declares the tunnel down. A hold time of three times the keepalive time tolerates two lost probes, which is the common rule of thumb.</li>
<li>Both values trade speed against stability: very short timers detect failure sooner but may flap on a lossy link.</li>
</ul>
<p>The lab configures both ends, which is the normal and tidy design.</p>

<h3>Verification</h3>
<p>The detail output shows whether keepalives are on and what state they are in. Real output from the lab, before and after the OAM line:</p>
<pre class="out"><span class="c">! before: no OAM configuration</span>
lab@R1&gt; show interfaces gr-0/0/0.0 detail | match keepalive
    <span class="hl">Gre keepalives configured: Off, Gre keepalives adjacency state: down</span>

<span class="c">! after: keepalive-time 5 hold-time 15 on both routers</span>
lab@R1&gt; show interfaces gr-0/0/0.0 detail | match keepalive
    <span class="hl">Gre keepalives configured: On, Gre keepalives adjacency state: Up</span></pre>
<p>Notice what "Off ... down" means: with keepalives off the adjacency state reads <i>down</i> only because nobody is monitoring it, while the unit itself is Up. Do not read that line as a fault. With keepalives on, the adjacency state is the real health of the tunnel. When it turns down, the unit goes down, routes over the tunnel are removed, and your routing protocol or a floating static route can switch to another path.</p>

<h3>Keepalives are GRE only</h3>
<p>IP-IP has no keepalive mechanism of its own. If you need fast failure detection on an IP-IP tunnel you rely on the routing protocol running over it, or on BFD (covered in the high-availability module) between the overlay addresses. That is another reason many networks default to GRE.</p>

<div class="eg"><p><b>Worked example.</b> keepalive-time 5 and hold-time 15. R3 loses power at 10:00:00. R1's probes at 10:00:05, 10:00:10 and 10:00:15 get no reply, so around 15 seconds later R1 takes the tunnel down. Without keepalives, an OSPF neighbour would need its full 40-second dead interval to notice, and a static route would never notice.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring keepalives under the wrong hierarchy (for example on the interface) or on the wrong unit name. The statement is <code>protocols oam gre-tunnel interface gr-0/0/0.0</code>, and the interface must include the unit. Another mistake is a hold-time smaller than the keepalive-time, which can never work sensibly.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The tunnel is Up but traffic fails. What detects a dead far end on a GRE tunnel?" Answer: GRE keepalives under <code>protocols oam gre-tunnel</code>. A tunnel key does not do this, and MTU settings are irrelevant.</p></div>

<div class="scn"><h4>Backup path that never took over</h4><p>A bank branch had a GRE tunnel as primary and an LTE link as a floating static backup. When the head-end router rebooted, the tunnel stayed Up for the branch and traffic was sent into the void for twenty minutes, because the primary static route never left the table. After the team added keepalives with a 5-second interval and 15-second hold time, the next reboot caused the tunnel to drop within seconds and the floating static route took over.</p><p><b>Lesson:</b> a static route over a tunnel is only as good as the tunnel's failure detection.</p></div>

<div class="iv"><p class="q">"How does a Junos router detect that a GRE tunnel's far end has died?"</p><p>With GRE keepalives configured under <code>protocols oam gre-tunnel interface gr-0/0/0.0</code>, using keepalive-time and hold-time. The probe is reflected by the far end, so silence for the hold time brings the unit down and withdraws routes. Without keepalives the unit stays Up as long as the destination is routable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tunnel unit is Up when the destination is routable, not when the far end works.</li>
<li>GRE keepalives live under <code>protocols oam gre-tunnel</code>.</li>
<li>keepalive-time is the probe interval; hold-time is the silence limit before down.</li>
<li>Check <code>show interfaces gr-0/0/0.0 detail</code> for the keepalive lines.</li>
<li>IP-IP has no keepalives; use the routing protocol or BFD instead.</li>
</ul></div>
`,hi:`
<p>Ek hairaan karne wali baat: tunnel interface ke paas cable nahi hota. Fibre par roshni nahi, khone ke liye koi electrical signal nahi. To router ko kaise pata chalta hai ki far end zinda hai? Default mein nahi chalta. Yeh chapter is problem aur Junos ke solution, GRE keepalives, ko samjhata hai.</p>

<h3>Problem: Up ka matlab working nahi</h3>
<p>GRE ya IP-IP unit tab up aata hai jab tunnel destination <b>routable</b> ho. Hamare lab mein R1 ke paas ISP ki taraf default route hai, isliye 203.0.113.9 hamesha routable hai, chahe R3 band ho, cable nikla ho ya galat configure ho. Tunnel Up rehta hai aur R1 traffic ko black hole mein bhejta rehta hai. OSPF aakhir mein pakad leta (point-to-point link par uska dead timer default 40 second hai), lekin tunnel ke through static routes kabhi nahi pakadte.</p>
<p>Hum chahte hain ek chhota heartbeat: R1 poochta hai "kya tum ho?", R3 jawab deta hai, aur jawab kaafi der band rahe to tunnel down maana jaaye taaki uske routes hat jaayein aur backup path le sake.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="GRE keepalive exchange">
<rect x="30" y="40" width="120" height="100" rx="10" fill="#bbf7d0"/><text x="90" y="95" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="490" y="40" width="120" height="100" rx="10" fill="#bbf7d0"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="150" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="2"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">keepalive (har 5 s)</text>
<line x1="490" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">far end wapas laut deta hai</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Hold time (15 s) tak jawab nahi: R1 tunnel down maanta hai</text>
</svg><p class="cap">R1 chhota GRE packet bhejta hai; far end use wapas bhej deta hai. Hold time tak khamoshi matlab down.</p></div>

<h3>GRE keepalives kaise kaam karte hain</h3>
<p>Router ek keepalive packet banata hai jo khud ko hi address hota hai, use far end ki taraf GRE mein lapetta hai aur bhejta hai. Far router ko ise samajhne ki zaroorat nahi: woh bas decapsulate karta hai, dekhta hai ki packet sender ke liye hai, aur apne tunnel se wapas route kar deta hai. Jawab aate hi sender ko pata chal jaata hai ki poora round trip kaam kar raha hai. Isliye keepalives path ke <b>dono directions</b> aur far router ke tunnel ko test karte hain, sirf kisi address ki reachability nahi.</p>

<h3>Configuration</h3>
<p>Keepalives OAM (operations, administration and maintenance) hierarchy ke neeche hote hain, interface ke neeche nahi:</p>
<pre class="code"><span class="c">! R1 aur R3 dono par: har 5 s mein ek keepalive, 15 s baad dead</span>
set protocols oam gre-tunnel interface gr-0/0/0.0 keepalive-time 5 hold-time 15
commit</pre>
<ul>
<li><b>keepalive-time</b> probes ke beech ka interval hai, seconds mein.</li>
<li><b>hold-time</b> woh waqt hai jitna router bina jawab ke intezaar karke tunnel ko down declare karta hai. Keepalive time ka teen guna hold time do probes ke kho jaane ko jhel leta hai, yeh aam rule of thumb hai.</li>
<li>Dono values speed aur stability ka sauda hain: bahut chhote timers failure jaldi pakadte hain lekin lossy link par flap kar sakte hain.</li>
</ul>
<p>Lab dono ends par configure karta hai, jo normal aur saaf design hai.</p>

<h3>Verification</h3>
<p>Detail output batata hai ki keepalives on hain ya nahi aur kis state mein hain. Lab ka real output, OAM line se pehle aur baad:</p>
<pre class="out"><span class="c">! pehle: koi OAM configuration nahi</span>
lab@R1&gt; show interfaces gr-0/0/0.0 detail | match keepalive
    <span class="hl">Gre keepalives configured: Off, Gre keepalives adjacency state: down</span>

<span class="c">! baad mein: dono routers par keepalive-time 5 hold-time 15</span>
lab@R1&gt; show interfaces gr-0/0/0.0 detail | match keepalive
    <span class="hl">Gre keepalives configured: On, Gre keepalives adjacency state: Up</span></pre>
<p>Dhyan do "Off ... down" ka matlab: keepalives off hone par adjacency state <i>down</i> isliye padhta hai ki koi monitor nahi kar raha, jabki unit khud Up hai. Is line ko fault mat samjho. Keepalives on hon to adjacency state tunnel ki asli health hai. Jab woh down hota hai, unit down ho jaata hai, tunnel ke routes hat jaate hain, aur aapka routing protocol ya floating static route doosre path par switch kar sakta hai.</p>

<h3>Keepalives sirf GRE ke liye</h3>
<p>IP-IP ka apna keepalive mechanism nahi hai. IP-IP tunnel par tez failure detection chahiye to uspar chalne wale routing protocol par, ya overlay addresses ke beech BFD par (high-availability module mein) nirbhar karte hain. Yeh ek aur wajah hai ki kai networks default mein GRE chunte hain.</p>

<div class="eg"><p><b>Worked example.</b> keepalive-time 5 aur hold-time 15. R3 ki power 10:00:00 par jaati hai. 10:00:05, 10:00:10 aur 10:00:15 ke R1 ke probes ka jawab nahi aata, to lagbhag 15 second baad R1 tunnel down kar deta hai. Keepalives ke bina OSPF neighbour ko pakadne mein poora 40-second dead interval lagta, aur static route kabhi nahi pakadta.</p></div>

<div class="warn"><p><b>Common mistake.</b> Keepalives ko galat hierarchy mein (jaise interface par) ya galat unit name ke saath configure karna. Statement <code>protocols oam gre-tunnel interface gr-0/0/0.0</code> hai, aur interface mein unit shamil honi chahiye. Ek aur galti: hold-time ko keepalive-time se chhota rakhna, jo kabhi samajhdari se kaam nahi kar sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Tunnel Up hai lekin traffic fail ho raha hai. GRE tunnel ka dead far end kaun pakadta hai?" Jawab: <code>protocols oam gre-tunnel</code> ke neeche GRE keepalives. Tunnel key yeh nahi karta, aur MTU settings is mein irrelevant hain.</p></div>

<div class="scn"><h4>Backup path jo kabhi aaya hi nahi</h4><p>Ek bank branch ke paas primary GRE tunnel aur floating static backup ke roop mein LTE link tha. Head-end router reboot hua to branch ke liye tunnel Up raha aur bees minute tak traffic void mein jaata raha, kyunki primary static route table se kabhi hata hi nahi. Team ne 5-second interval aur 15-second hold time ke keepalives jode, to agle reboot par tunnel kuch seconds mein gir gaya aur floating static route ne kaam sambhal liya.</p><p><b>Lesson:</b> tunnel ke through static route utna hi achha hai jitni achhi tunnel ki failure detection.</p></div>

<div class="iv"><p class="q">"Junos router ko kaise pata chalta hai ki GRE tunnel ka far end mar gaya?"</p><p><code>protocols oam gre-tunnel interface gr-0/0/0.0</code> ke neeche keepalive-time aur hold-time ke saath GRE keepalives se. Probe far end wapas reflect karta hai, isliye hold time tak khamoshi unit ko down karti hai aur routes hata deti hai. Keepalives ke bina destination routable rahe to unit Up hi rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel unit tab Up hota hai jab destination routable ho, tab nahi jab far end kaam kare.</li>
<li>GRE keepalives <code>protocols oam gre-tunnel</code> ke neeche hote hain.</li>
<li>keepalive-time probe interval hai; hold-time down hone se pehle ki khamoshi ki seema.</li>
<li>Keepalive lines ke liye <code>show interfaces gr-0/0/0.0 detail</code> dekho.</li>
<li>IP-IP mein keepalives nahi; routing protocol ya BFD use karo.</li>
</ul></div>
`}};export{e as default};