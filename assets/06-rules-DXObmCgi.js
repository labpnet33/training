var e={id:`rules`,h:{en:`SD-WAN rules: steering traffic with strategies`,hi:`SD-WAN rules: strategies se traffic steer karna`},body:{en:`
<p>An <b>SD-WAN rule</b> (a "service" in the CLI) says: "traffic that looks like this should use these members, chosen this way". It has a <b>match</b> part (source, destination, protocol and port, an Internet Service Database application such as a SaaS, or user) and a <b>strategy</b> part. Rules are read <b>top to bottom</b> and the first rule that matches decides; this is the same idea as a policy route, evaluated before the routing table.</p>
<pre class="code"><span class="c">! Try it: lab "A performance SLA and failover when ISP-A degrades"</span>
config system sdwan
    config service
        edit 1
            set name "VOICE-LOW-LATENCY"
            set mode sla
            set dst "all"
            set src "VOICE-NET"
            set protocol 17
            set start-port 5060
            set end-port 5061
            config sla
                edit "INTERNET-PING"
                    set id 1
                next
            end
            set priority-members 1 2
        next
        edit 2
            set name "BACKUPS-CHEAP"
            set mode manual
            set dst "BACKUP-SERVERS"
            set priority-members 2
        next
    end
end</pre>
<p>Rule 1 sends the voice network's SIP traffic over member 1 as long as it meets SLA 1 of the health check, otherwise over member 2. Rule 2 pins traffic to the backup servers to member 2, the cheap link (manual mode). In a rule, <code>priority-members</code> lists members in order of preference.</p>
<h3>The strategies (modes)</h3>
<table class="cmp"><tr><th>GUI name</th><th>CLI mode</th><th>What it does</th></tr><tr><td>Manual</td><td><code>manual</code></td><td>Always use the listed member (if alive).</td></tr><tr><td>Best Quality</td><td><code>priority</code> (link-cost-factor)</td><td>Use the member with the best measured value of the chosen factor, for example latency.</td></tr><tr><td>Lowest Cost (SLA)</td><td><code>sla</code></td><td>Use the first member in priority-members that meets the SLA.</td></tr><tr><td>Maximize Bandwidth (SLA)</td><td><code>load-balance</code></td><td>Share sessions over all members that meet the SLA.</td></tr></table>
<div class="note"><p><b>Note.</b> Mode names have changed between FortiOS releases and an older <code>auto</code> mode still exists for the quality-based behaviour. Always check the choices with <code>set mode ?</code> on the firmware you are using, and read the GUI strategy name in the exam as the authoritative description.</p></div>
<h3>Matching on applications</h3>
<p>Instead of addresses a rule can match <b>Internet Service Database (ISDB)</b> objects, which FortiGuard keeps up to date with the addresses of well-known SaaS and cloud services. In the CLI that is <code>set internet-service enable</code> and <code>set internet-service-name</code>, choosing the name from the list shown by <code>?</code> on your build. Application control signatures can be used as well, but they only work after the first packets have been inspected, so a session can start on one link and be steered later.</p>
<h3>Tie-break</h3>
<p>When two members are equally good, <code>tie-break</code> decides: <code>zone</code> (the default), <code>cfg-order</code> (order in the configuration), <code>fib-best-match</code> or <code>input-device</code>. Set it explicitly when the result matters.</p>
<div class="warn"><p><b>Common mistake.</b> Putting a broad rule (dst all, src all) above a specific one. The first match wins, so the specific rule below it never runs. Order rules from most specific to least specific.</p></div>
<div class="exam"><p><b>Exam trap.</b> Rules are matched top-down and are evaluated before the routing table. A rule needs a strategy (mode) and members; SLA-based modes need a health check and SLA id.</p></div>
<div class="scn"><h4>Voice never moved</h4><p>The company created a voice rule with a strict SLA, but calls stayed on the lossy link. The log showed that an older catch-all rule placed first matched all traffic. Moving the voice rule to position 1 fixed it without touching the SLA.</p><p><b>Lesson:</b> Check rule order before suspecting the measurements.</p></div>
<div class="iv"><p class="q">"Name the SD-WAN rule strategies and when you would use each."</p><p>Manual for a fixed path; Best Quality to pick the lowest latency, jitter or loss link for voice or video; Lowest Cost (SLA) to use the cheap link as long as it meets the SLA; Maximize Bandwidth (SLA) to share bulk traffic across all good links. Mention that rules match top-down and before the routing table.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A rule has a match part and a strategy; rules are read top-down.</li><li>Strategies: manual, best quality, lowest cost (SLA), maximize bandwidth (SLA).</li><li>priority-members lists members in order of preference.</li><li>ISDB objects let rules match SaaS applications.</li></ul></div>
`,hi:`
<p><b>SD-WAN rule</b> (CLI mein "service") kehta hai: "aisa dikhne wala traffic in members ko is tarah chunkar use kare". Ismein <b>match</b> hissa (source, destination, protocol aur port, Internet Service Database ki application jaise SaaS, ya user) aur <b>strategy</b> hissa hota hai. Rules <b>upar se neeche</b> padhe jaate hain aur pehla matching rule decide karta hai; yeh policy route ka hi idea hai, routing table se pehle evaluate hota hai.</p>
<pre class="code"><span class="c">! Try it: lab "Performance SLA aur ISP-A kharab hone par failover"</span>
config system sdwan
    config service
        edit 1
            set name "VOICE-LOW-LATENCY"
            set mode sla
            set dst "all"
            set src "VOICE-NET"
            set protocol 17
            set start-port 5060
            set end-port 5061
            config sla
                edit "INTERNET-PING"
                    set id 1
                next
            end
            set priority-members 1 2
        next
        edit 2
            set name "BACKUPS-CHEAP"
            set mode manual
            set dst "BACKUP-SERVERS"
            set priority-members 2
        next
    end
end</pre>
<p>Rule 1 voice network ke SIP traffic ko member 1 par bhejta hai jab tak woh health check ka SLA 1 poora kare, warna member 2 par. Rule 2 backup servers ke traffic ko member 2, yaani sasti link, par pin karta hai (manual mode). Rule mein <code>priority-members</code> members ko preference ke order mein list karta hai.</p>
<h3>Strategies (modes)</h3>
<table class="cmp"><tr><th>GUI naam</th><th>CLI mode</th><th>Yeh kya karta hai</th></tr><tr><td>Manual</td><td><code>manual</code></td><td>Listed member hamesha use karo (alive ho to).</td></tr><tr><td>Best Quality</td><td><code>priority</code> (link-cost-factor)</td><td>Chune hue factor, jaise latency, ki sabse achhi measured value wala member use karo.</td></tr><tr><td>Lowest Cost (SLA)</td><td><code>sla</code></td><td>priority-members mein pehla member use karo jo SLA poora kare.</td></tr><tr><td>Maximize Bandwidth (SLA)</td><td><code>load-balance</code></td><td>SLA poora karne wale saare members par sessions baanto.</td></tr></table>
<div class="note"><p><b>Note.</b> FortiOS releases ke beech mode names badle hain aur quality-based behaviour ke liye purana <code>auto</code> mode ab bhi hai. Jo firmware use kar rahe ho us par <code>set mode ?</code> se choices check karo, aur exam mein GUI strategy name ko authoritative description maano.</p></div>
<h3>Applications par match karna</h3>
<p>Addresses ki jagah rule <b>Internet Service Database (ISDB)</b> objects par match kar sakta hai, jinhe FortiGuard well-known SaaS aur cloud services ke addresses ke saath up to date rakhta hai. CLI mein yeh <code>set internet-service enable</code> aur <code>set internet-service-name</code> hai, jahan naam aapke build par <code>?</code> se dikhne wali list se chuno. Application control signatures bhi use ho sakti hain, lekin ve pehle packets inspect hone ke baad hi kaam karti hain, isliye session ek link se shuru hokar baad mein steer ho sakta hai.</p>
<h3>Tie-break</h3>
<p>Do members barabar achhe hon to <code>tie-break</code> decide karta hai: <code>zone</code> (default), <code>cfg-order</code> (configuration ka order), <code>fib-best-match</code> ya <code>input-device</code>. Jab result matter kare to explicitly set karo.</p>
<div class="warn"><p><b>Common galti.</b> Broad rule (dst all, src all) ko specific rule ke upar rakhna. Pehla match jeetta hai, isliye neeche ka specific rule kabhi nahi chalta. Rules ko sabse specific se sabse kam specific order mein rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Rules upar se neeche match hote hain aur routing table se pehle evaluate hote hain. Rule ko strategy (mode) aur members chahiye; SLA-based modes ko health check aur SLA id chahiye.</p></div>
<div class="scn"><h4>Voice kabhi move nahi hui</h4><p>Company ne strict SLA wala voice rule banaya, lekin calls lossy link par hi rahi. Log se pata chala ki pehle rakha purana catch-all rule saare traffic se match karta tha. Voice rule ko position 1 par le jaane se SLA chhue bina fix ho gaya.</p><p><b>Seekh:</b> Measurements par shak karne se pehle rule order check karo.</p></div>
<div class="iv"><p class="q">"SD-WAN rule strategies ke naam batao aur har ek kab use karoge."</p><p>Manual fixed path ke liye; Best Quality voice ya video ke liye sabse kam latency, jitter ya loss wali link chunne ke liye; Lowest Cost (SLA) jab tak sasti link SLA poora kare use use karne ke liye; Maximize Bandwidth (SLA) bulk traffic ko saari achhi links par baantne ke liye. Batao ki rules upar se neeche aur routing table se pehle match hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Rule mein match hissa aur strategy hoti hai; rules upar se neeche padhe jaate hain.</li><li>Strategies: manual, best quality, lowest cost (SLA), maximize bandwidth (SLA).</li><li>priority-members members ko preference ke order mein list karta hai.</li><li>ISDB objects rules ko SaaS applications match karne dete hain.</li></ul></div>
`}};export{e as default};