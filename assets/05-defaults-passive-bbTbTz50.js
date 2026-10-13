var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(215,e(10,20,170,60,`#bae6fd`,r[0],r[1])+e(235,20,170,60,`#bbf7d0`,r[2],r[3])+e(460,20,170,60,`#ddd6fe`,r[4],r[5])+e(10,120,170,60,`#fde68a`,r[6],r[7])+e(235,120,170,60,`#fed7aa`,r[8],r[9])+e(460,120,170,60,`#e2e8f0`,r[10],r[11])+t(180,50,235,50)+t(405,50,460,50)+t(95,80,95,120)+t(320,80,320,120)+t(545,80,545,120),r[12]),i=`<pre class="code">! Reference configuration (not run in the simulator)
config system sdwan
    config health-check
        edit "PASSIVE-WEB"
            set detect-mode passive
            set members 1 2
            config sla
                edit 1
                    set latency-threshold 200
                    set jitter-threshold 50
                    set packetloss-threshold 3
                next
            end
        next
        edit "PREFER-PASSIVE"
            set detect-mode prefer-passive
            set protocol ping
            set server "10.255.0.1"
            set members 1 2
        next
    end
end
config firewall policy
    edit 10
        set passive-wan-health-measurement enable
    next
end
! remove a Default check you do not want (name as shown on your unit)
config system sdwan
    config health-check
        delete "Default_AWS"
    end
end</pre>`,a={id:`defaults-passive`,h:{en:`The built-in Default health checks and passive measurement from real traffic`,hi:`Built-in Default health checks aur real traffic se passive measurement`},body:{en:`
<p>Probes tell you about a path <b>when you send them</b>. Real users tell you about the path <b>while they use it</b>. This chapter covers two features that sit around the normal active probe: the health checks FortiOS ships with, and measuring real traffic instead of (or besides) probes. Think of a restaurant: the inspector's test visit is an active probe; the customers' reviews are passive measurement.</p>
<h3>The embedded Default health checks</h3>
<p>Recent FortiOS releases include a set of predefined performance SLAs, usually shown in the GUI with names that start with <b>Default</b>. From what Fortinet publishes, the set is: <b>Default_AWS</b>, <b>Default_DNS</b>, <b>Default_FortiGuard</b>, <b>Default_Gmail</b>, <b>Default_Google Search</b> and <b>Default_Office_365</b>. They probe well-known internet destinations, with a slow rhythm (for example one probe every two minutes), and are meant as ready-made monitors that you can attach to members. Details differ between releases, so check the list on your own unit in the GUI (<b>Network &gt; SD-WAN &gt; Performance SLAs</b>) or in the CLI.</p>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Are they a good basis for steering?</td><td>Usually not. Two-minute intervals detect failures far too slowly for voice, and the target is a third party you do not control.</td></tr>
<tr><td>What changed over releases?</td><td>Fortinet's notes say the default probe protocol moved from ping to HTTPS in the 7.4.4 era; after an upgrade the check may fail if HTTPS to the target is blocked.</td></tr>
<tr><td>Any risk?</td><td>A public advisory warned that probes to a cloud provider's main web site from FortiGates would be blocked from October 2025, and recommended removing the Default_AWS check. A default check that fails can make a link look unhealthy.</td></tr>
<tr><td>What should I do?</td><td>Review the list on every unit. Remove or unassign the ones you do not need. Create your own checks for steering, with your own server and timers.</td></tr></table>
<div class="note"><p><b>Note.</b> I describe the Default checks from Fortinet's published notes. Exact names, servers and intervals can differ on your release; read the unit instead of assuming.</p></div>
<h3>Passive WAN health measurement</h3>
<p>Instead of sending probes, the FortiGate can measure the <b>real TCP sessions</b> that cross each member. It estimates <b>latency</b> from the round-trip time of the TCP connection set-up and tear-down, and <b>jitter and packet loss</b> from information in the TCP headers (for example retransmissions). Because it uses real traffic, it sees what users see, to the destinations they actually use.</p>
`+r([`Active`,`probes every interval`,`Passive`,`measures real TCP`,`Prefer passive`,`passive, active if idle`,`Good for`,`liveness, quiet links`,`Good for`,`real quality, SaaS paths`,`Good for`,`best of both`,`Three detect modes: active (default), passive, prefer-passive.`])+`
<h3>The three detect modes</h3>
<table class="cmp"><tr><th>Mode (<code>detect-mode</code>)</th><th>How it measures</th><th>Strength</th><th>Limit</th></tr>
<tr><td><code>active</code></td><td>Sends probes</td><td>Works with no user traffic; finds dead links.</td><td>Probes may not see what users see.</td></tr>
<tr><td><code>passive</code></td><td>Measures real TCP sessions only</td><td>Accurate to the real destinations; no probe load.</td><td>Cannot detect a dead link without traffic; needs the policy setting; disables hardware acceleration for the measured traffic.</td></tr>
<tr><td><code>prefer-passive</code></td><td>Passive while TCP traffic exists, active after a quiet period (about three minutes)</td><td>Real data when busy, liveness when idle.</td><td>Same acceleration cost when passive is used.</td></tr></table>
<h3>Turning it on</h3>
<p>Two parts are needed: a health check in passive (or prefer-passive) mode, and the setting <code>passive-wan-health-measurement</code> on the <b>firewall policy</b> that carries the traffic. The measurement is only taken for sessions that match a policy with that setting.</p>
`+i+`
<h3>Application-based measurement</h3>
<p>A related feature measures <b>per internet service or application</b>: the FortiGate keeps separate loss, latency and jitter numbers for each application (for example one SaaS suite) per member, so the SD-WAN can compare the path to <em>that</em> service on each link, rather than the path to a generic probe server. This is powerful for SaaS steering, because the best link to one cloud region is not always the best link to another. In recent releases (from 7.6.4 per a Fortinet community note, so verify) the passive configuration is optional for application performance monitoring. Where you enable it, in the Performance SLA GUI look for the probe mode option, and confirm details for your firmware in Fortinet's administration guide.</p>
<div class="eg"><p><b>Worked example: same link, two truths.</b> The active ping to the hub says ISP1 has 12 ms latency and 0 percent loss. Passive measurement of the real TCP sessions to a SaaS provider shows 85 ms and 2 percent loss on ISP1, but 60 ms and 0.1 percent on ISP2, because ISP1's route to that provider is poor. The ping check would keep sending SaaS over ISP1; the passive or application-based result sends it over ISP2.</p></div>
<h3>Combining active and passive</h3>
<p>A common design is an <b>active</b> health check for liveness (fast failover on a dead link) plus a <b>passive</b> or application-based check for quality (the SaaS rules reference this). A rule can use more than one health check through its SLA entries. If you want one check to do both, <code>prefer-passive</code> gives passive data when there is traffic and probes when there is none.</p>
<div class="warn"><p><b>Common mistake.</b> Enabling passive measurement on a high-throughput policy without testing. Traffic measured passively cannot use hardware acceleration, so CPU load rises and throughput can fall on busy units. Enable it on the policies that matter (SaaS, voice) and watch CPU.</p></div>
<div class="exam"><p><b>Exam trap.</b> Passive mode cannot detect a dead member by itself because it needs traffic. Pair it with active probes or use prefer-passive. And remember the policy-level setting; without it the passive health check has no data.</p></div>
<div class="scn"><h4>Green pings, slow SaaS</h4><p>A bank branch saw complaints about a cloud CRM although its ping health check showed ISP1 perfect. The team enabled passive measurement on the CRM policy. The data showed 2 percent loss on ISP1 to that provider only. A rule that used the passive SLA moved the CRM traffic to ISP2 and complaints stopped; voice, which was fine on ISP1, stayed there.</p><p><b>Lesson:</b> Measure the path the application uses, not only a convenient probe target.</p></div>
<div class="iv"><p class="q">"When would you use passive instead of active health checks?"</p><p>When I care about the quality of real application paths, such as SaaS, and the probe target does not represent them. I keep an active check for liveness because passive cannot see a dead link without traffic, or I use prefer-passive. I watch the cost: passive measurement disables hardware acceleration for those sessions.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Default health checks (AWS, DNS, FortiGuard, Gmail, Google Search, Office 365) are slow-rhythm monitors; review and remove what you do not need.</li><li>Detect modes: active, passive, prefer-passive.</li><li>Passive uses real TCP sessions, needs passive-wan-health-measurement on the policy, cannot find dead links alone and disables acceleration.</li><li>Application-based measurement compares the path to each application per member.</li><li>Pair active for liveness with passive for quality.</li></ul></div>
`,hi:`
<p>Probes aapko path ke baare mein <b>tab batate hain jab aap unhe bhejte ho</b>. Real users aapko path ke baare mein <b>tab batate hain jab woh use use karte hain</b>. Yeh chapter do features cover karta hai jo normal active probe ke aas-paas hain: FortiOS ke saath aane wale health checks, aur probes ke badle (ya saath) real traffic ko naapna. Restaurant socho: inspector ka test visit active probe hai; customers ke reviews passive measurement hain.</p>
<h3>Embedded Default health checks</h3>
<p>Recent FortiOS releases mein predefined performance SLAs ka ek set aata hai, jo GUI mein aam taur par <b>Default</b> se shuru hone wale naamon se dikhta hai. Fortinet jo publish karta hai uske hisaab se set hai: <b>Default_AWS</b>, <b>Default_DNS</b>, <b>Default_FortiGuard</b>, <b>Default_Gmail</b>, <b>Default_Google Search</b> aur <b>Default_Office_365</b>. Woh well-known internet destinations ko dheemi rhythm se probe karte hain (jaise har do minute mein ek probe), aur ready-made monitors ki tarah hain jinhe aap members se jod sakte ho. Details releases ke beech alag hote hain, isliye apni unit par GUI (<b>Network &gt; SD-WAN &gt; Performance SLAs</b>) ya CLI mein list check karo.</p>
<table class="cmp"><tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>Kya woh steering ke liye achhi buniyaad hain?</td><td>Aam taur par nahi. Do-minute ke intervals voice ke liye failures bahut dheere detect karte hain, aur target aisa third party hai jo aapke control mein nahi.</td></tr>
<tr><td>Releases mein kya badla?</td><td>Fortinet ke notes kehte hain ki default probe protocol 7.4.4 ke aas-paas ping se HTTPS par gaya; upgrade ke baad agar target tak HTTPS block ho to check fail ho sakta hai.</td></tr>
<tr><td>Koi risk?</td><td>Ek public advisory ne chetavni di ki October 2025 se FortiGates se ek cloud provider ki main web site ko probes block kiye jaayenge, aur Default_AWS check hataane ki salah di. Fail hota default check link ko unhealthy dikha sakta hai.</td></tr>
<tr><td>Mujhe kya karna chahiye?</td><td>Har unit par list review karo. Jo nahi chahiye use hatao ya unassign karo. Steering ke liye apne server aur timers ke saath apne checks banao.</td></tr></table>
<div class="note"><p><b>Note.</b> Main Default checks ko Fortinet ke published notes se describe karta hoon. Exact naam, servers aur intervals aapke release par alag ho sakte hain; maanne ki jagah unit padho.</p></div>
<h3>Passive WAN health measurement</h3>
<p>Probes bhejne ki jagah FortiGate har member se guzarte <b>real TCP sessions</b> ko naap sakta hai. Woh <b>latency</b> TCP connection set-up aur tear-down ke round-trip time se, aur <b>jitter aur packet loss</b> TCP headers ki jaankari se (jaise retransmissions) estimate karta hai. Real traffic use karta hai, isliye woh dekhta hai jo users dekhte hain, un destinations tak jahan woh sach mein jaate hain.</p>
`+r([`Active`,`har interval probes`,`Passive`,`real TCP naapta hai`,`Prefer passive`,`passive, idle ho to active`,`Achha`,`liveness, quiet links`,`Achha`,`real quality, SaaS paths`,`Achha`,`dono ka best`,`Teen detect modes: active (default), passive, prefer-passive.`])+`
<h3>Teen detect modes</h3>
<table class="cmp"><tr><th>Mode (<code>detect-mode</code>)</th><th>Kaise naapta hai</th><th>Taakat</th><th>Seema</th></tr>
<tr><td><code>active</code></td><td>Probes bhejta hai</td><td>User traffic ke bina bhi chalta hai; dead links dhoondhta hai.</td><td>Probes wahi nahi dekhte jo users dekhte hain.</td></tr>
<tr><td><code>passive</code></td><td>Sirf real TCP sessions naapta hai</td><td>Real destinations ke liye accurate; probe load nahi.</td><td>Bina traffic ke dead link detect nahi kar sakta; policy setting chahiye; naape gaye traffic ke liye hardware acceleration disable karta hai.</td></tr>
<tr><td><code>prefer-passive</code></td><td>TCP traffic ho to passive, shaant period (lagbhag teen minute) ke baad active</td><td>Busy mein real data, idle mein liveness.</td><td>Passive use hone par wahi acceleration cost.</td></tr></table>
<h3>On karna</h3>
<p>Do hisse chahiye: passive (ya prefer-passive) mode wala health check, aur woh <b>firewall policy</b> par <code>passive-wan-health-measurement</code> setting jo traffic uthati hai. Measurement sirf un sessions ke liye hota hai jo us setting wali policy se match karte hain.</p>
`+i+`
<h3>Application-based measurement</h3>
<p>Ek related feature <b>har internet service ya application</b> ke hisaab se naapta hai: FortiGate har application (jaise ek SaaS suite) ke liye har member par alag loss, latency aur jitter numbers rakhta hai, taaki SD-WAN generic probe server ke path ki jagah <em>us</em> service ke path ko har link par compare kar sake. Yeh SaaS steering ke liye shaktishali hai, kyunki ek cloud region ki best link doosre ki best link hamesha nahi hoti. Recent releases mein (Fortinet community note ke hisaab se 7.6.4 se, isliye verify karo) application performance monitoring ke liye passive configuration optional hai. Jahan enable karo, Performance SLA GUI mein probe mode option dekho, aur apne firmware ki details Fortinet ki administration guide mein confirm karo.</p>
<div class="eg"><p><b>Worked example: ek link, do sach.</b> Hub ko active ping kehta hai ISP1 ki latency 12 ms aur loss 0 percent hai. Ek SaaS provider ke real TCP sessions ka passive measurement ISP1 par 85 ms aur 2 percent loss dikhata hai, par ISP2 par 60 ms aur 0.1 percent, kyunki us provider tak ISP1 ka route kharab hai. Ping check SaaS ko ISP1 par bhejta rehta; passive ya application-based result use ISP2 par bhejta hai.</p></div>
<h3>Active aur passive ko milana</h3>
<p>Aam design hai liveness ke liye <b>active</b> health check (dead link par tez failover) plus quality ke liye <b>passive</b> ya application-based check (SaaS rules ise refer karte hain). Rule apne SLA entries ke zariye ek se zyada health check use kar sakta hai. Agar ek hi check dono kaam kare to <code>prefer-passive</code> traffic hone par passive data aur na hone par probes deta hai.</p>
<div class="warn"><p><b>Common galti.</b> Bina test kiye high-throughput policy par passive measurement enable karna. Passively naape gaye traffic hardware acceleration use nahi kar sakta, isliye CPU load badhta hai aur busy units par throughput gir sakta hai. Use un policies par enable karo jo maayne rakhti hain (SaaS, voice) aur CPU dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Passive mode akele dead member detect nahi kar sakta kyunki use traffic chahiye. Use active probes ke saath jodo ya prefer-passive use karo. Aur policy-level setting yaad rakho; uske bina passive health check ke paas data nahi hota.</p></div>
<div class="scn"><h4>Green pings, slow SaaS</h4><p>Ek bank branch ko cloud CRM par shikayatein thi jabki uska ping health check ISP1 ko perfect dikhata tha. Team ne CRM policy par passive measurement enable kiya. Data ne sirf us provider ke liye ISP1 par 2 percent loss dikhaya. Passive SLA use karne wale rule ne CRM traffic ko ISP2 par bheja aur shikayatein ruk gayi; voice, jo ISP1 par theek thi, wahin rahi.</p><p><b>Seekh:</b> Us path ko naapo jo application use karti hai, sirf suvidhajanak probe target ko nahi.</p></div>
<div class="iv"><p class="q">"Active ki jagah passive health checks kab use karoge?"</p><p>Jab mujhe real application paths ki quality ki parwaah ho, jaise SaaS, aur probe target unka pratinidhitva na kare. Main liveness ke liye active check rakhta hoon kyunki passive bina traffic ke dead link nahi dekh sakta, ya prefer-passive use karta hoon. Cost bhi dekhta hoon: passive measurement un sessions ke liye hardware acceleration disable karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Default health checks (AWS, DNS, FortiGuard, Gmail, Google Search, Office 365) dheemi rhythm ke monitors hain; review karo aur jo nahi chahiye use hatao.</li><li>Detect modes: active, passive, prefer-passive.</li><li>Passive real TCP sessions use karta hai, policy par passive-wan-health-measurement chahiye, akele dead links nahi dhoondh sakta aur acceleration disable karta hai.</li><li>Application-based measurement har application ke path ko per member compare karta hai.</li><li>Liveness ke liye active aur quality ke liye passive jodo.</li></ul></div>
`}};export{a as default};