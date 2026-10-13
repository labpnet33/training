var e={id:`sdwan-rules-with-shaping`,h:{en:`SD-WAN rules with shaping: load balancing by bandwidth, SLA and the underlay`,hi:`Shaping ke saath SD-WAN rules: bandwidth se load balancing, SLA aur underlay`},body:{en:`
<p>SD-WAN decides <b>which link</b> a flow uses. Shaping decides <b>how much</b> of that link the flow may take. Used together they answer a real question: "BULK traffic fills ISP1; can it move to ISP2 before voice suffers?" This chapter shows how the two features cooperate, and where they do not know about each other.</p>
<h3>Who acts first</h3>
<ol><li>The firewall policy and the SD-WAN rule choose the <b>egress member</b> (for example wan1).</li><li>The shaping policy matches the session (its <code>dstintf</code> may be the SD-WAN zone) and assigns the shaper or the class.</li><li>The shaping profile of the <b>egress member interface</b> queues the packet.</li></ol>
<p>The SD-WAN rule is not aware of the queue depth. It looks at the SLA, the cost, the bandwidth measurement or the volume ratio. If the shaper on wan1 is full and the SLA does not yet fail, the rule keeps sending traffic to wan1. You have to make the rule watch what the shaper protects.</p>
<h3>Rule strategies that use bandwidth</h3>
<table class="cmp"><tr><th>Setting</th><th>What it does</th><th>Example</th></tr><tr><td><code>mode load-balance</code> (GUI: Maximize Bandwidth)</td><td>Spreads sessions over all eligible members that meet the SLA.</td><td>BULK backups use wan1 and wan2.</td></tr><tr><td><code>hash-mode</code></td><td>How sessions are distributed: round-robin, source-ip-based, source-dest-ip-based, or by measured inbandwidth, outbandwidth or bibandwidth.</td><td>Pick source-ip-based when one user must stay on one link.</td></tr><tr><td><code>volume-ratio</code> (member)</td><td>The proportion of sessions per member in a load-balance rule.</td><td>wan1 = 5 and wan2 = 2 for a 50 and 20 Mbit/s pair.</td></tr><tr><td><code>spillover-threshold</code> (member)</td><td>A bandwidth threshold (kbit/s) after which new sessions use the next member in a spillover-style rule.</td><td>wan1 spills over to wan2 at 45 Mbit/s.</td></tr><tr><td><code>link-cost-factor</code> with inbandwidth, outbandwidth or bibandwidth</td><td>Chooses the member with the most free bandwidth in the lowest-cost rule.</td><td>Best-quality rule with bandwidth as a factor.</td></tr></table>
<p>The bandwidth that SD-WAN uses for these decisions is measured on the interface and compared to the <code>estimated-upstream-bandwidth</code> and <code>estimated-downstream-bandwidth</code> of chapter 4, so set them. A spillover threshold only works if it is below the real capacity of the link.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: bulk traffic is spread over both ISPs by their capacity (50 and 20 Mbit/s = 5:2)</span>
config system sdwan
    config members
        edit 1
            set interface "wan1"
            set zone "virtual-wan-link"
            set volume-ratio 5
        next
        edit 2
            set interface "wan2"
            set zone "virtual-wan-link"
            set volume-ratio 2
        next
    end
    config service
        edit 20
            set name "BULK-LB"
            set mode load-balance
            set dst "all"
            set tos 0x20
            set tos-mask 0xfc
            set priority-members 1 2
            set health-check "HC-INET"
        next
    end
end</pre>
<div class="note"><p>Here the rule matches ToS 0x20 (CS1, scavenger) with mask 0xfc, a mark that a backup server or a firewall policy has already set. Another simple choice is a rule on application or ISDB. The options of the <code>config service</code> block and their order depend on your build, so check the CLI help (<code>set ?</code>) of the version you run.</p></div>
<h3>Rule plus shaper: three working patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Rule</th><th>Shaping</th></tr><tr><td>Voice on the best link</td><td>Best quality or lowest latency, with SLA, match EF</td><td>VOICE-SHARED guaranteed on every member, high priority</td></tr><tr><td>SaaS on the preferred link</td><td>ISDB rule, manual or SLA-based, wan1 first</td><td>Class BUSINESS, default class, 40 percent guaranteed</td></tr><tr><td>Bulk uses leftovers</td><td>Load balance on both links</td><td>Class BULK with a maximum; the same class on both members</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="diagram"><rect x="20" y="20" width="120" height="40" rx="6" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">Voice (EF)</text><rect x="20" y="90" width="120" height="40" rx="6" fill="#bbf7d0"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="12">SaaS</text><rect x="20" y="160" width="120" height="40" rx="6" fill="#fed7aa"/><text x="80" y="185" text-anchor="middle" class="svg-ink" font-size="12">Bulk backup</text><rect x="240" y="60" width="150" height="100" rx="8" fill="#e2e8f0"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN rules</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="11">choose the member</text><rect x="500" y="40" width="120" height="50" rx="6" fill="#bae6fd"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="12">wan1 50M + profile</text><rect x="500" y="130" width="120" height="50" rx="6" fill="#bae6fd"/><text x="560" y="160" text-anchor="middle" class="svg-ink" font-size="12">wan2 20M + profile</text><line x1="140" y1="40" x2="240" y2="90" stroke="#64748b"/><line x1="140" y1="110" x2="240" y2="110" stroke="#64748b"/><line x1="140" y1="180" x2="240" y2="130" stroke="#64748b"/><line x1="390" y1="90" x2="500" y2="65" stroke="#64748b"/><line x1="390" y1="130" x2="500" y2="155" stroke="#64748b"/></svg><p class="cap">The rule picks the link, then the link's own profile queues the packet.</p></div>
<h3>Shaping on the underlay or on the overlay?</h3>
<p>The overlay tunnels HUB1-VPN1 and HUB1-VPN2 ride on wan1 and wan2. Two choices:</p>
<ul><li><b>Underlay shaping (recommended).</b> Set <code>outbandwidth</code> and the egress profile on wan1 and wan2. The tunnel's ESP packets keep the DSCP of the inner packet, so a profile that matches the class sees the voice inside the tunnel. All overlay tunnels on one link share the link's limit, which is what the ISP enforces.</li><li><b>Overlay shaping.</b> A shaper on the tunnel interface limits one tunnel. A community report shows that on a tunnel the maximum worked but the guarantee did not. Use it only to limit (for example a tunnel to a paid cloud path), and test the guarantee before you promise it.</li></ul>
<h3>Link-quality and shaping: closing the loop</h3>
<p>When a shaper starts to drop, the effect is loss and latency on that link. The SLA health check from the SLA module notices this, because the probes are queued with the user traffic (unless you give the probe its own class, which is a common design choice). When latency or loss crosses the threshold, SD-WAN moves the sensitive rules to the other link. So the pair is: <b>shaping protects voice locally while SLA moves voice away when the link as a whole is bad</b>. Remember that probes are local-out traffic; they fall in the profile's default class unless a shaping policy with <code>traffic-type local-out</code> assigns them a class.</p>
<div class="warn"><p><b>Common mistake.</b> A spillover threshold of 50 Mbit/s on a 50 Mbit/s link. At the threshold the link is already full, the queue is long, and the SLA is already failing. Use about 85 to 90 percent of the real capacity.</p></div>
<div class="exam"><p><b>Exam trap.</b> The SD-WAN rule picks the interface; the shaping policy and profile act on the egress interface after that. Maximize Bandwidth is <code>mode load-balance</code>, and <code>volume-ratio</code> weights the members. Guarantees are not reliable on tunnel interfaces, so shape on the underlay and use DSCP for the tunnel.</p></div>
<div class="scn"><h4>Backups crush the VoIP link</h4><p>BR1's nightly backup of 40 Mbit/s starts at 18:00 when the call centre is still active. The backup rule ran with "Maximize Bandwidth" over both links, class BULK was not set, so everything went to the default class. After the changes: ToS CS1 on backups, a shaping policy for class 4 (maximum 30 percent), class 2 for voice with 15 percent guaranteed, and a volume ratio of 5:2. Voice kept its R-factor and the backup took about 8 hours, as planned.</p><p><b>Lesson:</b> Load balancing needs a cap, or it consumes the capacity that voice needs.</p></div>
<div class="iv"><p class="q">"How do SD-WAN rules and traffic shaping work together?"</p><p>The SD-WAN rule chooses the egress member, using SLA, cost or load-balance with volume ratios. Then the shaping policy classifies the session and the egress interface's profile queues it. The rule does not see the queue, so I set the profile on the underlay, keep a margin in spillover thresholds, give the SLA probes a class, and let SLA move voice if the link as a whole degrades.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>SD-WAN chooses the link, the shaper chooses the share of that link.</li><li>Maximize Bandwidth is load-balance; use volume-ratio, hash-mode and spillover to distribute.</li><li>Estimated bandwidth values feed SD-WAN bandwidth decisions.</li><li>Shape on the underlay; do not rely on guarantees on tunnel interfaces.</li><li>Shaping protects locally, SLA moves traffic when the whole link is bad.</li></ul></div>
`,hi:`
<p>SD-WAN tay karta hai ki flow <b>kaun si link</b> use kare. Shaping tay karta hai ki flow us link ka <b>kitna hissa</b> le sakta hai. Saath mein yeh ek asli sawaal ka jawab dete hain: "BULK traffic ISP1 bhar de to kya voice ke taklif mein aane se pehle woh ISP2 par ja sakta hai?" Yeh chapter dikhata hai ki dono features kaise saath kaam karte hain, aur kahan ek doosre ko nahi jaante.</p>
<h3>Pehle kaun kaam karta hai</h3>
<ol><li>Firewall policy aur SD-WAN rule <b>egress member</b> chunte hain (jaise wan1).</li><li>Shaping policy session ko match karti hai (uska <code>dstintf</code> SD-WAN zone ho sakta hai) aur shaper ya class assign karti hai.</li><li><b>Egress member interface</b> ka shaping profile packet ko queue karta hai.</li></ol>
<p>SD-WAN rule ko queue depth ka pata nahi hota. Woh SLA, cost, bandwidth measurement ya volume ratio dekhta hai. Agar wan1 ka shaper bhara hai aur SLA abhi fail nahi hua, to rule wan1 par hi traffic bhejta rehta hai. Rule ko woh dekhna sikhana padta hai jo shaper bachata hai.</p>
<h3>Bandwidth use karne wali rule strategies</h3>
<table class="cmp"><tr><th>Setting</th><th>Kya karti hai</th><th>Example</th></tr><tr><td><code>mode load-balance</code> (GUI: Maximize Bandwidth)</td><td>Sessions ko SLA poora karne wale sab eligible members mein failata hai.</td><td>BULK backups wan1 aur wan2 use karte hain.</td></tr><tr><td><code>hash-mode</code></td><td>Sessions kaise baante jaate hain: round-robin, source-ip-based, source-dest-ip-based, ya measured inbandwidth, outbandwidth ya bibandwidth se.</td><td>Jab ek user ek hi link par rahe to source-ip-based chuno.</td></tr><tr><td><code>volume-ratio</code> (member)</td><td>Load-balance rule mein har member par sessions ka anupaat.</td><td>50 aur 20 Mbit/s ki jodi ke liye wan1 = 5 aur wan2 = 2.</td></tr><tr><td><code>spillover-threshold</code> (member)</td><td>Bandwidth threshold (kbit/s) jiske baad spillover-style rule mein naye sessions agle member par jaate hain.</td><td>wan1 45 Mbit/s par wan2 mein spill karta hai.</td></tr><tr><td><code>link-cost-factor</code> inbandwidth, outbandwidth ya bibandwidth ke saath</td><td>Lowest-cost rule mein sabse zyaada free bandwidth wala member chunta hai.</td><td>Best-quality rule jisme bandwidth ek factor ho.</td></tr></table>
<p>SD-WAN in decisions ke liye jo bandwidth use karta hai woh interface par measure hoti hai aur chapter 4 ke <code>estimated-upstream-bandwidth</code> aur <code>estimated-downstream-bandwidth</code> se compare hoti hai, isliye unhe set karo. Spillover threshold tabhi kaam karta hai jab woh link ki asal capacity se neeche ho.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: bulk traffic is spread over both ISPs by their capacity (50 and 20 Mbit/s = 5:2)</span>
config system sdwan
    config members
        edit 1
            set interface "wan1"
            set zone "virtual-wan-link"
            set volume-ratio 5
        next
        edit 2
            set interface "wan2"
            set zone "virtual-wan-link"
            set volume-ratio 2
        next
    end
    config service
        edit 20
            set name "BULK-LB"
            set mode load-balance
            set dst "all"
            set tos 0x20
            set tos-mask 0xfc
            set priority-members 1 2
            set health-check "HC-INET"
        next
    end
end</pre>
<div class="note"><p>Yahan rule ToS 0x20 (CS1, scavenger) ko mask 0xfc ke saath match karta hai, jo mark backup server ya firewall policy pehle hi set kar chuki hai. Ek aur saral choice application ya ISDB par rule hai. <code>config service</code> block ke options aur unka order aapke build par nirbhar karte hain, isliye chalaye ja rahe version ka CLI help (<code>set ?</code>) dekho.</p></div>
<h3>Rule plus shaper: teen kaam karne wale patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Rule</th><th>Shaping</th></tr><tr><td>Voice best link par</td><td>Best quality ya lowest latency, SLA ke saath, EF match</td><td>Har member par VOICE-SHARED guaranteed, high priority</td></tr><tr><td>SaaS preferred link par</td><td>ISDB rule, manual ya SLA-based, pehle wan1</td><td>Class BUSINESS, default class, 40 percent guaranteed</td></tr><tr><td>Bulk bache hue par</td><td>Dono links par load balance</td><td>Maximum ke saath class BULK; dono members par wahi class</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="diagram"><rect x="20" y="20" width="120" height="40" rx="6" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">Voice (EF)</text><rect x="20" y="90" width="120" height="40" rx="6" fill="#bbf7d0"/><text x="80" y="115" text-anchor="middle" class="svg-ink" font-size="12">SaaS</text><rect x="20" y="160" width="120" height="40" rx="6" fill="#fed7aa"/><text x="80" y="185" text-anchor="middle" class="svg-ink" font-size="12">Bulk backup</text><rect x="240" y="60" width="150" height="100" rx="8" fill="#e2e8f0"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN rules</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="11">member chunte hain</text><rect x="500" y="40" width="120" height="50" rx="6" fill="#bae6fd"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="12">wan1 50M + profile</text><rect x="500" y="130" width="120" height="50" rx="6" fill="#bae6fd"/><text x="560" y="160" text-anchor="middle" class="svg-ink" font-size="12">wan2 20M + profile</text><line x1="140" y1="40" x2="240" y2="90" stroke="#64748b"/><line x1="140" y1="110" x2="240" y2="110" stroke="#64748b"/><line x1="140" y1="180" x2="240" y2="130" stroke="#64748b"/><line x1="390" y1="90" x2="500" y2="65" stroke="#64748b"/><line x1="390" y1="130" x2="500" y2="155" stroke="#64748b"/></svg><p class="cap">Rule link chunta hai, phir us link ka apna profile packet ko queue karta hai.</p></div>
<h3>Underlay par shaping ya overlay par?</h3>
<p>Overlay tunnels HUB1-VPN1 aur HUB1-VPN2 wan1 aur wan2 par chalte hain. Do choices:</p>
<ul><li><b>Underlay shaping (recommended).</b> wan1 aur wan2 par <code>outbandwidth</code> aur egress profile set karo. Tunnel ke ESP packets inner packet ka DSCP rakhte hain, isliye class match karne wala profile tunnel ke andar ki voice dekhta hai. Ek link par saare overlay tunnels link ki limit share karte hain, jo ISP enforce karta hai.</li><li><b>Overlay shaping.</b> Tunnel interface par shaper ek tunnel ko limit karta hai. Ek community report batati hai ki tunnel par maximum chala par guarantee nahi. Sirf limit ke liye use karo (jaise paid cloud path ka tunnel), aur promise karne se pehle guarantee test karo.</li></ul>
<h3>Link-quality aur shaping: loop band karna</h3>
<p>Jab shaper drop karna shuru karta hai to us link par loss aur latency badhti hai. SLA module ka health check yeh notice karta hai, kyunki probes user traffic ke saath queue hote hain (jab tak aap probe ko apni class na dein, jo common design choice hai). Jab latency ya loss threshold paar karti hai, SD-WAN sensitive rules ko doosri link par le jaata hai. Yaani jodi yeh hai: <b>shaping voice ko local roop se bachata hai, aur jab poori link kharaab ho to SLA voice ko door le jaata hai</b>. Yaad rakho probes local-out traffic hain; woh profile ki default class mein girte hain jab tak <code>traffic-type local-out</code> wali shaping policy unhe class na de.</p>
<div class="warn"><p><b>Common galti.</b> 50 Mbit/s link par 50 Mbit/s ka spillover threshold. Threshold par link pehle hi bhari hoti hai, queue lambi hoti hai, aur SLA pehle hi fail ho raha hota hai. Asal capacity ka lagbhag 85 se 90 percent use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> SD-WAN rule interface chunta hai; uske baad shaping policy aur profile egress interface par kaam karte hain. Maximize Bandwidth <code>mode load-balance</code> hai, aur <code>volume-ratio</code> members ko weight deta hai. Tunnel interfaces par guarantees bharosemand nahi, isliye underlay par shape karo aur tunnel ke liye DSCP use karo.</p></div>
<div class="scn"><h4>Backups VoIP link ko kuchal dete hain</h4><p>BR1 ka 40 Mbit/s ka nightly backup 18:00 baje shuru hota hai jab call centre abhi active hai. Backup rule "Maximize Bandwidth" se dono links par chalta tha, class BULK set nahi thi, isliye sab kuch default class mein tha. Badlav ke baad: backups par ToS CS1, class 4 ke liye shaping policy (maximum 30 percent), voice ke liye class 2 jisme 15 percent guaranteed, aur volume ratio 5:2. Voice ka R-factor bana raha aur backup ko lagbhag 8 ghante lage, jaisa plan tha.</p><p><b>Seekh:</b> Load balancing ko cap chahiye, warna woh woh capacity kha jaata hai jo voice ko chahiye.</p></div>
<div class="iv"><p class="q">"SD-WAN rules aur traffic shaping saath mein kaise kaam karte hain?"</p><p>SD-WAN rule egress member chunta hai, SLA, cost ya volume ratio ke saath load-balance se. Phir shaping policy session ko classify karti hai aur egress interface ka profile use queue karta hai. Rule queue nahi dekhta, isliye main profile underlay par rakhta hoon, spillover thresholds mein margin rakhta hoon, SLA probes ko class deta hoon, aur agar poori link degrade ho to SLA ko voice hataane deta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>SD-WAN link chunta hai, shaper us link ka hissa.</li><li>Maximize Bandwidth load-balance hai; volume-ratio, hash-mode aur spillover se distribute karo.</li><li>Estimated bandwidth values SD-WAN ke bandwidth decisions ko feed karti hain.</li><li>Underlay par shape karo; tunnel interfaces par guarantees par bharosa mat karo.</li><li>Shaping local roop se bachata hai, SLA tab traffic hataata hai jab poori link kharaab ho.</li></ul></div>
`}};export{e as default};