var e={id:`shared-and-per-ip-shapers`,h:{en:`Shared and per-IP traffic shapers`,hi:`Shared aur per-IP traffic shapers`},body:{en:`
<p>The traffic shaper is the basic building block. A <b>shared shaper</b> is one bandwidth budget for everything that uses it. A <b>per-IP shaper</b> gives <b>each source IP address</b> its own limit. They answer different questions: "how much may the backup class take in total?" and "how much may one guest take?".</p>
<h3>The shared traffic shaper</h3>
<table class="cmp"><tr><th>Option</th><th>Meaning</th></tr><tr><td><code>guaranteed-bandwidth</code></td><td>Bandwidth reserved for the traffic of this shaper when the link is busy.</td></tr><tr><td><code>maximum-bandwidth</code></td><td>The cap. 0 means no limit.</td></tr><tr><td><code>priority</code></td><td>low, medium or high. Higher priority is more likely to be forwarded without delay and without losing its guarantee.</td></tr><tr><td><code>per-policy</code></td><td>enable: each policy that uses the shaper gets its own copy of the limits. disable (default): all policies share one budget.</td></tr><tr><td><code>bandwidth-unit</code></td><td>kbps (default), mbps or gbps. Values go up to 100,000,000 in the chosen unit.</td></tr><tr><td><code>overhead</code></td><td>Extra bytes per packet that the shaper counts (for example for encapsulation).</td></tr><tr><td><code>diffserv</code> and <code>diffservcode</code></td><td>Change the DSCP of traffic accepted by this shaper (chapter 5).</td></tr></table>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: a voice shaper with a guarantee and a bulk shaper with a cap</span>
config firewall shaper traffic-shaper
    edit "VOICE-SHARED"
        set guaranteed-bandwidth 5000
        set maximum-bandwidth 10000
        set priority high
    next
    edit "BULK-30M"
        set maximum-bandwidth 30000
        set priority low
    next
end</pre>
<p>On the 50 Mbit/s uplink of wan1, voice always has 5 Mbit/s available (when it needs it), can burst to 10 Mbit/s, and wins the queue against everything else. Bulk traffic never exceeds 30 Mbit/s, and takes what is left at low priority.</p>
<h3>What guarantee, maximum and priority really mean</h3>
<ul><li>The <b>maximum</b> is a hard cap, always enforced, even on an empty link.</li><li>The <b>guarantee</b> only matters when the link is full. On an empty link a shaper may send up to its maximum; when the link fills up, a shaper that is below its guarantee is served first.</li><li>The <b>priority</b> decides who gets the bandwidth that nobody has guaranteed. Priority also matters only during congestion.</li></ul>
<div class="eg"><p>The wan1 uplink has 50 Mbit/s. Voice uses 4 Mbit/s (guarantee 5), a backup tries to send 45 Mbit/s with a cap of 30 Mbit/s, and web browsing wants 20 Mbit/s with no shaper. Total demand: 4 + 30 + 20 = 54 Mbit/s, more than 50. The link is congested. Voice keeps its 4, and the remaining 46 Mbit/s are shared by priority. If web is medium and the backup is low, web takes its 20 and the backup is squeezed to 26 Mbit/s. At 3 a.m. with only the backup active, it simply gets its 30 Mbit/s cap.</p></div>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="20" y="50" width="600" height="46" rx="6" fill="#e2e8f0"/><rect x="20" y="50" width="48" height="46" fill="#bbf7d0"/><rect x="68" y="50" width="240" height="46" fill="#fed7aa"/><rect x="308" y="50" width="160" height="46" fill="#bae6fd"/><text x="44" y="78" text-anchor="middle" class="svg-ink" font-size="11">4</text><text x="188" y="78" text-anchor="middle" class="svg-ink" font-size="12">backup 26 (low)</text><text x="388" y="78" text-anchor="middle" class="svg-ink" font-size="12">web 20 (medium)</text><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">wan1 uplink 50 Mbit/s, congested</text><rect x="20" y="130" width="600" height="46" rx="6" fill="#e2e8f0"/><rect x="20" y="130" width="360" height="46" fill="#fed7aa"/><text x="200" y="158" text-anchor="middle" class="svg-ink" font-size="12">backup 30 (its cap), 3 a.m.</text><text x="500" y="158" text-anchor="middle" class="svg-muted" font-size="12">unused 20</text></svg><p class="cap">The same shapers. Top: congested, priority decides. Bottom: quiet link, only the cap applies.</p></div>
<h3>per-policy: shared or separate?</h3>
<p>A shaper with guarantee 2 Mbit/s used by ten policies gives <b>2 Mbit/s in total</b> when <code>per-policy</code> is disabled, and 2 Mbit/s <b>to each of the ten policies</b> when enabled. Use shared for "all backups together", per-policy for "each department gets its own".</p>
<h3>The two directions</h3>
<p>Policies have a forward shaper, <code>traffic-shaper</code>, for the original direction, and a reverse shaper, <code>traffic-shaper-reverse</code>, for the reply direction. Shaping works on traffic leaving an interface, so for an upload (client to internet) the forward shaper limits traffic leaving wan1, and for a download the reverse shaper limits the replies leaving towards the LAN. If you set only the forward shaper, downloads are not shaped.</p>
<h3>The per-IP shaper</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: guests get 2 Mbit/s each and at most 100 sessions each</span>
config firewall shaper per-ip-shaper
    edit "GUEST-2M"
        set max-bandwidth 2000
        set max-concurrent-session 100
        set max-concurrent-tcp-session 80
        set max-concurrent-udp-session 20
    next
end</pre>
<p>One person with a laptop gets 2 Mbit/s; thirty people get 2 Mbit/s each, 60 Mbit/s in total, so combine it with a shared shaper or a profile when the link is smaller than the sum. The per-IP shaper also limits sessions, a defence against a host that opens thousands of connections. It is attached by a shaping policy (<code>per-ip-shaper</code>) or in a firewall policy.</p>
<h3>Checking the shapers</h3>
<pre class="out"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Illustrative output, abridged: the format documented by Fortinet</span>
BR1-FGT # diagnose firewall shaper traffic-shaper list
name VOICE-SHARED
maximum-bandwidth 1250 KB/sec
guaranteed-bandwidth 625 KB/sec
current-bandwidth 40 KB/sec
priority 1
<span class="hl">packets dropped 0</span>
bytes dropped 0

BR1-FGT # diagnose firewall shaper per-ip-shaper list
name GUEST-2M
maximum-bandwidth 250 KB/sec
addr=10.40.48.5 status: bps=0 ses=2</pre>
<p>Notice the unit: the CLI shows <b>bytes</b> (10 Mbit/s = 1,250 KB/s) while the GUI shows bits. Watch the dropped counters: a shaper that drops a lot is limiting. In a debug flow, the message "exceeded shaper limit, drop" tells you that a per-IP limit was hit. The command <code>diagnose firewall shaper traffic-shaper stats</code> gives combined statistics.</p>
<div class="warn"><p><b>Common mistake.</b> Confusing a shaper in the firewall policy with one in a shaping policy. If both exist, the <b>shaping policy wins</b>; the shaper in the firewall policy is ignored for matching traffic. Also: a guarantee with no <code>outbandwidth</code> on the interface has no reference for "full". Set the interface bandwidth (chapter 4).</p></div>
<div class="exam"><p><b>Exam trap.</b> Guarantee and priority matter only under congestion; maximum always applies. <code>per-policy</code> decides whether the budget is shared or repeated per policy. Per-IP shapers limit each source address, shared shapers limit the sum.</p></div>
<div class="scn"><h4>The department that took the whole link</h4><p>A branch had one shared shaper "OFFICE" with a maximum of 20 Mbit/s attached to ten policies. The accounting department complained of slowness all morning while marketing downloaded videos: together they shared the 20 Mbit/s. Enabling per-policy gave each policy its own 20 Mbit/s budget, and adding a per-IP shaper of 4 Mbit/s stopped any single user from monopolising a policy.</p><p><b>Lesson:</b> Choose shared or per-policy on purpose, and add a per-IP limit where individuals can misbehave.</p></div>
<div class="iv"><p class="q">"What is the difference between a shared shaper and a per-IP shaper?"</p><p>A shared shaper is one budget for all traffic that uses it: guaranteed, maximum and priority. A per-IP shaper applies a maximum bandwidth and session limits separately to each source IP. I use shared shapers for classes (voice, backup) and per-IP shapers for guest or student networks, and a shaping policy to attach either one. Guarantee and priority only matter when the link is congested.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Shared shaper: guaranteed, maximum, priority (low, medium, high), per-policy, bandwidth-unit.</li><li>Maximum is always a cap; guarantee and priority act under congestion.</li><li>per-policy gives each policy its own budget; otherwise one budget is shared.</li><li>Per-IP shaper: max-bandwidth and session limits per source IP.</li><li>Check with diagnose firewall shaper traffic-shaper list and per-ip-shaper list; the CLI shows bytes.</li></ul></div>
`,hi:`
<p>Traffic shaper basic building block hai. <b>Shared shaper</b> un sabke liye ek bandwidth budget hai jo use use karte hain. <b>Per-IP shaper</b> <b>har source IP address</b> ko apni limit deta hai. Dono alag sawaalon ka jawab dete hain: "backup class total kitna le sakti hai?" aur "ek guest kitna le sakta hai?".</p>
<h3>Shared traffic shaper</h3>
<table class="cmp"><tr><th>Option</th><th>Matlab</th></tr><tr><td><code>guaranteed-bandwidth</code></td><td>Link busy hone par is shaper ke traffic ke liye reserved bandwidth.</td></tr><tr><td><code>maximum-bandwidth</code></td><td>Cap. 0 ka matlab koi limit nahi.</td></tr><tr><td><code>priority</code></td><td>low, medium ya high. Higher priority ko bina delay aur bina apni guarantee khoye forward hone ki zyaada sambhavna hai.</td></tr><tr><td><code>per-policy</code></td><td>enable: shaper use karne wali har policy ko limits ki apni copy milti hai. disable (default): saari policies ek budget share karti hain.</td></tr><tr><td><code>bandwidth-unit</code></td><td>kbps (default), mbps ya gbps. Values chuni hui unit mein 100,000,000 tak jaati hain.</td></tr><tr><td><code>overhead</code></td><td>Har packet par extra bytes jo shaper ginta hai (jaise encapsulation ke liye).</td></tr><tr><td><code>diffserv</code> aur <code>diffservcode</code></td><td>Is shaper se accept hue traffic ka DSCP badalte hain (chapter 5).</td></tr></table>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: a voice shaper with a guarantee and a bulk shaper with a cap</span>
config firewall shaper traffic-shaper
    edit "VOICE-SHARED"
        set guaranteed-bandwidth 5000
        set maximum-bandwidth 10000
        set priority high
    next
    edit "BULK-30M"
        set maximum-bandwidth 30000
        set priority low
    next
end</pre>
<p>wan1 ki 50 Mbit/s uplink par voice ke paas hamesha 5 Mbit/s available hai (jab use chahiye), 10 Mbit/s tak burst kar sakti hai, aur queue mein baaki sab se jeet-ti hai. Bulk traffic kabhi 30 Mbit/s se upar nahi jaata, aur jo bachta hai woh low priority par leta hai.</p>
<h3>Guarantee, maximum aur priority asal mein kya hain</h3>
<ul><li><b>Maximum</b> hard cap hai, hamesha enforce hota hai, khaali link par bhi.</li><li><b>Guarantee</b> sirf tab matter karti hai jab link bhari ho. Khaali link par shaper apne maximum tak bhej sakta hai; link bharne par jo shaper apni guarantee se neeche hai use pehle serve kiya jaata hai.</li><li><b>Priority</b> tay karti hai ki jis bandwidth ki kisi ne guarantee nahi di use kaun paayega. Priority bhi sirf congestion mein matter karti hai.</li></ul>
<div class="eg"><p>wan1 uplink 50 Mbit/s ki hai. Voice 4 Mbit/s use karti hai (guarantee 5), ek backup 30 Mbit/s cap ke saath 45 Mbit/s bhejna chahta hai, aur web browsing bina shaper ke 20 Mbit/s chahti hai. Total demand: 4 + 30 + 20 = 54 Mbit/s, 50 se zyaada. Link congested hai. Voice apne 4 rakhti hai, aur bache 46 Mbit/s priority se baante jaate hain. Agar web medium hai aur backup low, to web apne 20 leti hai aur backup 26 Mbit/s par dab jaata hai. Raat 3 baje sirf backup active ho to use bas apna 30 Mbit/s cap milta hai.</p></div>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="20" y="50" width="600" height="46" rx="6" fill="#e2e8f0"/><rect x="20" y="50" width="48" height="46" fill="#bbf7d0"/><rect x="68" y="50" width="240" height="46" fill="#fed7aa"/><rect x="308" y="50" width="160" height="46" fill="#bae6fd"/><text x="44" y="78" text-anchor="middle" class="svg-ink" font-size="11">4</text><text x="188" y="78" text-anchor="middle" class="svg-ink" font-size="12">backup 26 (low)</text><text x="388" y="78" text-anchor="middle" class="svg-ink" font-size="12">web 20 (medium)</text><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">wan1 uplink 50 Mbit/s, congested</text><rect x="20" y="130" width="600" height="46" rx="6" fill="#e2e8f0"/><rect x="20" y="130" width="360" height="46" fill="#fed7aa"/><text x="200" y="158" text-anchor="middle" class="svg-ink" font-size="12">backup 30 (apna cap), raat 3 baje</text><text x="500" y="158" text-anchor="middle" class="svg-muted" font-size="12">unused 20</text></svg><p class="cap">Wahi shapers. Upar: congested, priority tay karti hai. Neeche: shaant link, sirf cap lagta hai.</p></div>
<h3>per-policy: shared ya alag?</h3>
<p>2 Mbit/s guarantee wala shaper jo das policies use karti hain, <code>per-policy</code> disabled ho to <b>kul 2 Mbit/s</b> deta hai, aur enabled ho to <b>das mein se har policy ko 2 Mbit/s</b>. "Saare backups saath mein" ke liye shared, "har department ko apna" ke liye per-policy use karo.</p>
<h3>Do directions</h3>
<p>Policies ke paas original direction ke liye forward shaper, <code>traffic-shaper</code>, aur reply direction ke liye reverse shaper, <code>traffic-shaper-reverse</code>, hota hai. Shaping interface se nikalne wale traffic par kaam karta hai, isliye upload (client se internet) ke liye forward shaper wan1 se nikalte traffic ko limit karta hai, aur download ke liye reverse shaper LAN ki taraf jaate replies ko limit karta hai. Sirf forward shaper set karo to downloads shape nahi hote.</p>
<h3>Per-IP shaper</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: guests get 2 Mbit/s each and at most 100 sessions each</span>
config firewall shaper per-ip-shaper
    edit "GUEST-2M"
        set max-bandwidth 2000
        set max-concurrent-session 100
        set max-concurrent-tcp-session 80
        set max-concurrent-udp-session 20
    next
end</pre>
<p>Laptop wale ek vyakti ko 2 Mbit/s milta hai; tees logon ko har ek ko 2 Mbit/s, kul 60 Mbit/s, isliye jab link sum se chhoti ho to ise shared shaper ya profile ke saath milao. Per-IP shaper sessions bhi limit karta hai, jo hazaaron connections kholne wale host ke khilaaf defence hai. Yeh shaping policy (<code>per-ip-shaper</code>) se ya firewall policy mein attach hota hai.</p>
<h3>Shapers check karna</h3>
<pre class="out"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Illustrative output, abridged: the format documented by Fortinet</span>
BR1-FGT # diagnose firewall shaper traffic-shaper list
name VOICE-SHARED
maximum-bandwidth 1250 KB/sec
guaranteed-bandwidth 625 KB/sec
current-bandwidth 40 KB/sec
priority 1
<span class="hl">packets dropped 0</span>
bytes dropped 0

BR1-FGT # diagnose firewall shaper per-ip-shaper list
name GUEST-2M
maximum-bandwidth 250 KB/sec
addr=10.40.48.5 status: bps=0 ses=2</pre>
<p>Unit dekho: CLI <b>bytes</b> dikhata hai (10 Mbit/s = 1,250 KB/s) jabki GUI bits dikhata hai. Dropped counters dekho: jo shaper bahut drop karta hai woh limit kar raha hai. Debug flow mein "exceeded shaper limit, drop" message batata hai ki per-IP limit hit hui. Command <code>diagnose firewall shaper traffic-shaper stats</code> combined statistics deta hai.</p>
<div class="warn"><p><b>Common galti.</b> Firewall policy ke shaper aur shaping policy ke shaper ko confuse karna. Dono hon to <b>shaping policy jeet-ti hai</b>; firewall policy ka shaper matching traffic ke liye ignore hota hai. Aur: interface par <code>outbandwidth</code> ke bina guarantee ke paas "full" ka reference nahi hota. Interface bandwidth set karo (chapter 4).</p></div>
<div class="exam"><p><b>Exam trap.</b> Guarantee aur priority sirf congestion mein matter karti hain; maximum hamesha lagta hai. <code>per-policy</code> tay karta hai ki budget shared hai ya har policy par dohraya jaata hai. Per-IP shapers har source address ko limit karte hain, shared shapers sum ko.</p></div>
<div class="scn"><h4>Department jisne poori link le li</h4><p>Ek branch mein ek shared shaper "OFFICE" tha 20 Mbit/s maximum ke saath jo das policies se juda tha. Accounting department subah bhar slowness ki shikayat karta raha jabki marketing videos download karti rahi: dono milkar 20 Mbit/s share karti thi. per-policy enable karne se har policy ko apna 20 Mbit/s budget mila, aur 4 Mbit/s ka per-IP shaper jodne se koi akela user policy par kabza nahi kar paya.</p><p><b>Seekh:</b> Shared ya per-policy soch samajhkar chuno, aur jahan individuals galat kar sakte hain wahan per-IP limit jodo.</p></div>
<div class="iv"><p class="q">"Shared shaper aur per-IP shaper mein kya fark hai?"</p><p>Shared shaper use karne wale saare traffic ke liye ek budget hai: guaranteed, maximum aur priority. Per-IP shaper har source IP par alag maximum bandwidth aur session limits lagata hai. Main classes (voice, backup) ke liye shared shapers aur guest ya student networks ke liye per-IP shapers use karta hoon, aur dono ko attach karne ke liye shaping policy. Guarantee aur priority sirf congested link par matter karti hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Shared shaper: guaranteed, maximum, priority (low, medium, high), per-policy, bandwidth-unit.</li><li>Maximum hamesha cap hai; guarantee aur priority congestion mein kaam karti hain.</li><li>per-policy har policy ko apna budget deta hai; warna ek budget share hota hai.</li><li>Per-IP shaper: har source IP par max-bandwidth aur session limits.</li><li>diagnose firewall shaper traffic-shaper list aur per-ip-shaper list se check karo; CLI bytes dikhata hai.</li></ul></div>
`}};export{e as default};