var e={id:`shaping-profiles-interface-bandwidth`,h:{en:`Shaping profiles, queues and interface bandwidth: outbandwidth, inbandwidth and policing`,hi:`Shaping profiles, queues aur interface bandwidth: outbandwidth, inbandwidth aur policing`},body:{en:`
<p>Shared shapers work flow group by flow group. A <b>shaping profile</b> works at the interface: it divides the whole link into <b>classes</b>, each with a priority, a guaranteed share and a maximum share, expressed as <b>percentages of the interface bandwidth</b>. Because the percentages are of the interface bandwidth, the interface must know how fast it really is. That is why this chapter starts with <code>outbandwidth</code>.</p>
<h3>The four steps</h3>
<ol><li>Set the interface bandwidth (<code>outbandwidth</code>, in kbit/s) on the egress interface.</li><li>Create the traffic classes (chapter 3) and the shaping profile with one entry per class.</li><li>Attach the profile to the interface: <code>egress-shaping-profile</code>.</li><li>Create shaping policies that put traffic into classes with <code>class-id</code>.</li></ol>
<h3>The shaping profile</h3>
<table class="cmp"><tr><th>Entry option</th><th>Meaning</th></tr><tr><td><code>class-id</code></td><td>Which class this entry shapes (2 and up).</td></tr><tr><td><code>priority</code></td><td>top, critical, high, medium or low: the order in which classes are served.</td></tr><tr><td><code>guaranteed-bandwidth-percentage</code></td><td>The share of the interface bandwidth reserved for the class under congestion.</td></tr><tr><td><code>maximum-bandwidth-percentage</code></td><td>The cap, as a share of the interface bandwidth.</td></tr><tr><td><code>burst-in-msec</code>, <code>cburst-in-msec</code></td><td>How long a class may burst at its maximum or at line speed.</td></tr><tr><td><code>min</code>, <code>max</code>, <code>limit</code>, <code>red-probability</code></td><td>Queue tuning for random early detection: when queued packets start to be dropped early so that TCP slows down before the queue is full.</td></tr></table>
<p>At profile level, <code>default-class-id</code> is the class for everything not classified by a shaping policy, including the FortiGate's own local traffic. The profile <code>type</code> is <b>queuing</b> (the egress profile, with queues) or <b>policing</b> (used for ingress, which drops instead of queueing).</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: wan1 has 50 Mbit/s upload (ISP1)</span>
config firewall shaping-profile
    edit "WAN1-PROFILE"
        set type queuing
        set default-class-id 3
        config shaping-entries
            edit 1
                set class-id 2
                set priority top
                set guaranteed-bandwidth-percentage 15
                set maximum-bandwidth-percentage 30
            next
            edit 2
                set class-id 3
                set priority high
                set guaranteed-bandwidth-percentage 40
                set maximum-bandwidth-percentage 100
            next
            edit 3
                set class-id 4
                set priority low
                set guaranteed-bandwidth-percentage 10
                set maximum-bandwidth-percentage 60
            next
        end
    next
end
config system interface
    edit "wan1"
        set outbandwidth 50000
        set inbandwidth 100000
        set estimated-upstream-bandwidth 50000
        set estimated-downstream-bandwidth 100000
        set egress-shaping-profile "WAN1-PROFILE"
    next
end</pre>
<div class="eg"><p>On 50 Mbit/s: VOICE (class 2) is guaranteed 15 percent = 7.5 Mbit/s and capped at 30 percent = 15 Mbit/s, served first (top). BUSINESS (class 3) is guaranteed 20 Mbit/s, may use the whole link, high priority, and is the default class. BULK (class 4) is guaranteed 5 Mbit/s, capped at 30 Mbit/s, served last. The guarantees add up to 65 percent; the remaining 35 percent (17.5 Mbit/s) is distributed by priority among classes that want more. The sum of the guarantees must never exceed 100 percent.</p></div>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="diagram"><rect x="20" y="40" width="600" height="50" rx="6" fill="#e2e8f0"/><rect x="20" y="40" width="90" height="50" fill="#bbf7d0"/><rect x="110" y="40" width="240" height="50" fill="#bae6fd"/><rect x="350" y="40" width="60" height="50" fill="#fed7aa"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">voice 15%</text><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="12">business 40%</text><text x="380" y="70" text-anchor="middle" class="svg-ink" font-size="11">bulk 10%</text><text x="520" y="70" text-anchor="middle" class="svg-muted" font-size="12">35% by priority</text><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">Guarantees on wan1 (outbandwidth 50 Mbit/s)</text><rect x="20" y="130" width="180" height="40" rx="6" fill="#bbf7d0"/><rect x="20" y="130" width="600" height="40" rx="6" fill="none" stroke="#64748b"/><text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="12">voice max 30%</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">business max 100%, bulk max 60% (not shown)</text></svg><p class="cap">Guarantees are the floor under congestion, maximums are the ceiling at all times.</p></div>
<h3>Interface bandwidth, inbound and outbound</h3>
<ul><li><code>outbandwidth</code>: the rate that queues are built for on egress. Set it close to, and not above, the real rate of the link (many designers use about 90 to 95 percent of the contract rate). If it is higher than reality, the queue forms in the ISP's equipment and shaping does nothing.</li><li><code>inbandwidth</code>: a limit on <b>incoming</b> traffic. It is <b>policing</b>: packets above the rate are dropped, and TCP senders slow down. You cannot queue what has already arrived.</li><li><code>estimated-upstream-bandwidth</code> and <code>estimated-downstream-bandwidth</code>: used to estimate link utilisation, for example by SD-WAN bandwidth-based rules and the SD-WAN monitor (chapter 6). They do not shape.</li><li><code>ingress-shaping-profile</code>: an interface profile for incoming traffic, of the policing type, to protect against floods of a class (for example, limit a guest VLAN's incoming rate).</li></ul>
<h3>Policing versus shaping on the exam</h3>
<table class="cmp"><tr><th></th><th>Shaping (queuing)</th><th>Policing</th></tr><tr><td>Action over the rate</td><td>Queue, then send later</td><td>Drop</td></tr><tr><td>Direction</td><td>Egress</td><td>Ingress (inbandwidth, ingress profile)</td></tr><tr><td>Effect on TCP</td><td>Delay, smooth</td><td>Loss, TCP slows down</td></tr><tr><td>Buffers needed</td><td>Yes</td><td>No</td></tr></table>
<h3>Where things go wrong</h3>
<ul><li><b>NP offload.</b> Hardware offload can hide packets from the shaper while you test. Disable offload for the test policy (<code>set auto-asic-offload disable</code>) and re-enable it after you measured. A profile also has an <code>npu-offloading</code> option.</li><li><b>IPsec tunnel interfaces.</b> A Fortinet community report on 7.2.8 shows that a profile on a VPN tunnel limited the maximum but did not deliver the guarantee, while the same profile on a physical port did. Shape on the physical underlay and use DSCP for the tunnel (chapter 6), and check the release notes of your version.</li><li><b>No shaping policy sets a class.</b> Everything then falls in the default class, so there is no prioritisation at all.</li></ul>
<div class="warn"><p><b>Common mistake.</b> Attaching an egress profile with no <code>outbandwidth</code> on the interface, or with the nominal 1 Gbit/s of the port while the ISP link is 50 Mbit/s. The queue the profile builds is only as good as the rate it is told.</p></div>
<div class="exam"><p><b>Exam trap.</b> Profile percentages refer to the interface bandwidth, so <code>outbandwidth</code> must be set. Priority order is top, critical, high, medium, low. Guarantees total at most 100 percent. <code>inbandwidth</code> and ingress profiles are policing.</p></div>
<div class="scn"><h4>Voice breaks while the link is half empty</h4><p>At a branch with a 20 Mbit/s ISP2 link, wan2 was left at its default port speed and had a shaping profile with 15 percent for voice. During backups, voice still crackled although the shaper graph showed the link 60 percent used. The profile computed 15 percent of 1 Gbit/s, a guarantee far above the real link, and the queue formed in the ISP modem. Setting <code>outbandwidth 18000</code> moved the queue to the FortiGate and voice recovered.</p><p><b>Lesson:</b> The interface rate is the foundation of every percentage.</p></div>
<div class="iv"><p class="q">"How does an interface shaping profile work, and what must be configured first?"</p><p>The profile divides the egress bandwidth into classes with priority, guaranteed and maximum percentages, plus a default class. Percentages refer to the interface bandwidth, so I first set outbandwidth to just below the real link rate, then attach the profile with egress-shaping-profile, and use shaping policies with class IDs to put traffic into classes. For incoming traffic only policing is possible: inbandwidth or an ingress profile.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A profile has entries: class-id, priority (top to low), guaranteed and maximum percentage; plus a default class.</li><li>Four steps: outbandwidth, classes and profile, egress-shaping-profile, shaping policies with class-id.</li><li>Percentages are of the interface bandwidth; set outbandwidth near the real rate.</li><li>inbandwidth and the ingress profile police; they drop instead of queueing.</li><li>Check NP offload and prefer shaping on the physical underlay for tunnels.</li></ul></div>
`,hi:`
<p>Shared shapers flow group ke hisaab se kaam karte hain. <b>Shaping profile</b> interface par kaam karta hai: woh poori link ko <b>classes</b> mein baantta hai, har ek ki priority, guaranteed share aur maximum share ke saath, jo <b>interface bandwidth ke percentages</b> mein likhe jaate hain. Kyunki percentages interface bandwidth ke hain, interface ko pata hona chahiye ki woh asal mein kitni tez hai. Isiliye yeh chapter <code>outbandwidth</code> se shuru hota hai.</p>
<h3>Chaar steps</h3>
<ol><li>Egress interface par interface bandwidth (<code>outbandwidth</code>, kbit/s mein) set karo.</li><li>Traffic classes (chapter 3) aur har class ki ek entry wala shaping profile banao.</li><li>Profile ko interface par attach karo: <code>egress-shaping-profile</code>.</li><li><code>class-id</code> se traffic ko classes mein daalne wali shaping policies banao.</li></ol>
<h3>Shaping profile</h3>
<table class="cmp"><tr><th>Entry option</th><th>Matlab</th></tr><tr><td><code>class-id</code></td><td>Yeh entry kaun si class shape karti hai (2 aur upar).</td></tr><tr><td><code>priority</code></td><td>top, critical, high, medium ya low: classes kis order mein serve hoti hain.</td></tr><tr><td><code>guaranteed-bandwidth-percentage</code></td><td>Congestion mein class ke liye reserved interface bandwidth ka hissa.</td></tr><tr><td><code>maximum-bandwidth-percentage</code></td><td>Cap, interface bandwidth ke hisse ke roop mein.</td></tr><tr><td><code>burst-in-msec</code>, <code>cburst-in-msec</code></td><td>Class kitni der apne maximum ya line speed par burst kar sakti hai.</td></tr><tr><td><code>min</code>, <code>max</code>, <code>limit</code>, <code>red-probability</code></td><td>Random early detection ke liye queue tuning: queue bharne se pehle hi packets kab drop hone lagte hain taaki TCP dheema ho jaye.</td></tr></table>
<p>Profile level par <code>default-class-id</code> woh class hai jo shaping policy se classify na hue har traffic ke liye hai, FortiGate ke apne local traffic samet. Profile ka <code>type</code> <b>queuing</b> (egress profile, queues ke saath) ya <b>policing</b> (ingress ke liye, jo queue ki jagah drop karta hai) hota hai.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! BR1-FGT: wan1 has 50 Mbit/s upload (ISP1)</span>
config firewall shaping-profile
    edit "WAN1-PROFILE"
        set type queuing
        set default-class-id 3
        config shaping-entries
            edit 1
                set class-id 2
                set priority top
                set guaranteed-bandwidth-percentage 15
                set maximum-bandwidth-percentage 30
            next
            edit 2
                set class-id 3
                set priority high
                set guaranteed-bandwidth-percentage 40
                set maximum-bandwidth-percentage 100
            next
            edit 3
                set class-id 4
                set priority low
                set guaranteed-bandwidth-percentage 10
                set maximum-bandwidth-percentage 60
            next
        end
    next
end
config system interface
    edit "wan1"
        set outbandwidth 50000
        set inbandwidth 100000
        set estimated-upstream-bandwidth 50000
        set estimated-downstream-bandwidth 100000
        set egress-shaping-profile "WAN1-PROFILE"
    next
end</pre>
<div class="eg"><p>50 Mbit/s par: VOICE (class 2) ko 15 percent = 7.5 Mbit/s guaranteed aur 30 percent = 15 Mbit/s par capped, sabse pehle serve (top). BUSINESS (class 3) ko 20 Mbit/s guaranteed, poori link use kar sakti hai, high priority, aur default class hai. BULK (class 4) ko 5 Mbit/s guaranteed, 30 Mbit/s par capped, sabse baad mein serve. Guarantees milakar 65 percent hain; bache 35 percent (17.5 Mbit/s) un classes mein priority se baante jaate hain jo zyaada chahti hain. Guarantees ka sum kabhi 100 percent se zyaada nahi hona chahiye.</p></div>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="diagram"><rect x="20" y="40" width="600" height="50" rx="6" fill="#e2e8f0"/><rect x="20" y="40" width="90" height="50" fill="#bbf7d0"/><rect x="110" y="40" width="240" height="50" fill="#bae6fd"/><rect x="350" y="40" width="60" height="50" fill="#fed7aa"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="12">voice 15%</text><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="12">business 40%</text><text x="380" y="70" text-anchor="middle" class="svg-ink" font-size="11">bulk 10%</text><text x="520" y="70" text-anchor="middle" class="svg-muted" font-size="12">35% priority se</text><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">wan1 par guarantees (outbandwidth 50 Mbit/s)</text><rect x="20" y="130" width="180" height="40" rx="6" fill="#bbf7d0"/><rect x="20" y="130" width="600" height="40" rx="6" fill="none" stroke="#64748b"/><text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="12">voice max 30%</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">business max 100%, bulk max 60% (nahi dikhaya)</text></svg><p class="cap">Guarantees congestion mein floor hain, maximums har waqt ceiling.</p></div>
<h3>Interface bandwidth, inbound aur outbound</h3>
<ul><li><code>outbandwidth</code>: woh rate jiske liye egress par queues banti hain. Ise asal rate ke kareeb, par us se upar nahi, set karo (kai designers contract rate ka lagbhag 90 se 95 percent use karte hain). Agar woh haqeeqat se zyaada hai to queue ISP ke equipment mein banti hai aur shaping kuch nahi karta.</li><li><code>inbandwidth</code>: <b>incoming</b> traffic par limit. Yeh <b>policing</b> hai: rate se upar ke packets drop hote hain, aur TCP senders dheeme ho jaate hain. Jo traffic aa chuka use queue nahi kar sakte.</li><li><code>estimated-upstream-bandwidth</code> aur <code>estimated-downstream-bandwidth</code>: link utilisation estimate karne ke liye, jaise SD-WAN bandwidth-based rules aur SD-WAN monitor (chapter 6). Yeh shape nahi karte.</li><li><code>ingress-shaping-profile</code>: incoming traffic ke liye interface profile, policing type ka, kisi class ke floods se bachne ke liye (jaise guest VLAN ki incoming rate limit karna).</li></ul>
<h3>Exam mein policing versus shaping</h3>
<table class="cmp"><tr><th></th><th>Shaping (queuing)</th><th>Policing</th></tr><tr><td>Rate se upar action</td><td>Queue, phir baad mein bhejo</td><td>Drop</td></tr><tr><td>Direction</td><td>Egress</td><td>Ingress (inbandwidth, ingress profile)</td></tr><tr><td>TCP par asar</td><td>Delay, smooth</td><td>Loss, TCP dheema</td></tr><tr><td>Buffers chahiye</td><td>Haan</td><td>Nahi</td></tr></table>
<h3>Kahan galat hota hai</h3>
<ul><li><b>NP offload.</b> Hardware offload test ke dauran packets ko shaper se chhupa sakta hai. Test policy ke liye offload disable karo (<code>set auto-asic-offload disable</code>) aur measure karne ke baad dobara enable karo. Profile mein <code>npu-offloading</code> option bhi hai.</li><li><b>IPsec tunnel interfaces.</b> 7.2.8 par ek Fortinet community report batati hai ki VPN tunnel par profile ne maximum limit kiya par guarantee nahi di, jabki wahi profile physical port par di. Physical underlay par shape karo aur tunnel ke liye DSCP use karo (chapter 6), aur apne version ke release notes dekho.</li><li><b>Koi shaping policy class set nahi karti.</b> Tab sab kuch default class mein girta hai, isliye koi prioritisation nahi hoti.</li></ul>
<div class="warn"><p><b>Common galti.</b> Interface par <code>outbandwidth</code> ke bina egress profile attach karna, ya port ke nominal 1 Gbit/s ke saath jabki ISP link 50 Mbit/s hai. Profile jo queue banata hai woh utni hi achhi hai jitni rate use batayi gayi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Profile percentages interface bandwidth ke hain, isliye <code>outbandwidth</code> set hona chahiye. Priority order top, critical, high, medium, low hai. Guarantees ka total zyaada se zyaada 100 percent. <code>inbandwidth</code> aur ingress profiles policing hain.</p></div>
<div class="scn"><h4>Link aadhi khaali hai phir bhi voice toot-ti hai</h4><p>20 Mbit/s ISP2 link wali branch mein wan2 apni default port speed par thi aur uska shaping profile voice ke liye 15 percent rakhta tha. Backups ke dauran voice phir bhi kharaab thi jabki shaper graph link 60 percent used dikhata tha. Profile 1 Gbit/s ka 15 percent compute kar raha tha, jo asal link se bahut upar guarantee hai, aur queue ISP modem mein ban rahi thi. <code>outbandwidth 18000</code> set karne se queue FortiGate mein aa gayi aur voice theek ho gayi.</p><p><b>Seekh:</b> Interface rate har percentage ki buniyaad hai.</p></div>
<div class="iv"><p class="q">"Interface shaping profile kaise kaam karta hai, aur pehle kya configure karna padta hai?"</p><p>Profile egress bandwidth ko priority, guaranteed aur maximum percentages wali classes mein baantta hai, plus ek default class. Percentages interface bandwidth ke hain, isliye main pehle outbandwidth ko asal link rate se thoda neeche set karta hoon, phir egress-shaping-profile se profile attach karta hoon, aur class IDs wali shaping policies se traffic ko classes mein daalta hoon. Incoming traffic ke liye sirf policing mumkin hai: inbandwidth ya ingress profile.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Profile ki entries: class-id, priority (top se low), guaranteed aur maximum percentage; plus default class.</li><li>Chaar steps: outbandwidth, classes aur profile, egress-shaping-profile, class-id wali shaping policies.</li><li>Percentages interface bandwidth ke hain; outbandwidth asal rate ke kareeb set karo.</li><li>inbandwidth aur ingress profile police karte hain; queue ki jagah drop karte hain.</li><li>NP offload check karo aur tunnels ke liye physical underlay par shaping prefer karo.</li></ul></div>
`}};export{e as default};