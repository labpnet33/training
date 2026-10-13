var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(200,e(10,70,110,60,`#bae6fd`,r[0],r[1])+e(160,20,150,50,`#bbf7d0`,r[2],r[3])+e(160,130,150,50,`#fed7aa`,r[4],r[5])+e(360,20,130,50,`#ddd6fe`,r[6],r[7])+e(360,130,130,50,`#ddd6fe`,r[8],r[9])+e(520,70,110,60,`#fecaca`,r[10],r[11])+t(120,100,160,45)+t(120,100,160,155)+t(310,45,360,45)+t(310,155,360,155)+t(490,45,520,95)+t(490,155,520,105),r[12]),i={id:`manual-quality`,h:{en:`Manual and Best Quality strategies`,hi:`Manual aur Best Quality strategies`},body:{en:`
<p>Two strategies are the workhorses of most designs. <b>Manual</b> says "use this member and nothing else is measured". <b>Best Quality</b> (CLI <code>mode priority</code>) says "use the member that scores best on the metric I name". Both rely on a <code>priority-members</code> list: the sequence numbers of the members that may be used, in preference order.</p>
<h3>Manual</h3>
<p>With manual mode you name one or more members. The session uses the <b>first member in the list that is usable</b>. A member is unusable when its interface is down, or, if you attached a health check, when that check declares it dead. There is no comparison of latency or loss. Typical uses: pin a management flow to the MPLS member, pin backup traffic to the cheap broadband, or pin a legacy application that breaks when its source address changes.</p>
<h3>Best Quality (priority)</h3>
<p>Here the rule attaches a health check and a <b>link cost factor</b>: latency, jitter, packet loss, or a bandwidth figure (incoming, outgoing, or bidirectional). The engine reads the current measurement of each listed member and chooses the best. When two members are close, the <b>order in the priority-members list</b> and the tie-break setting (chapter 6) decide. Without a threshold, a tiny difference such as 1 ms can flip the choice, so on noisy links you add a threshold or hold-down time so that traffic does not flap between members.</p>
<table class="cmp"><tr><th>Question</th><th>Manual</th><th>Best Quality</th></tr>
<tr><td>Uses measurements?</td><td>Only alive or dead</td><td>Yes, compares the chosen metric</td></tr>
<tr><td>CLI mode value</td><td><code>manual</code></td><td><code>priority</code></td></tr>
<tr><td>Chosen by</td><td>List order</td><td>Best score, list order breaks ties</td></tr>
<tr><td>Good for</td><td>Pinned flows, backup, legacy</td><td>Voice, video, interactive apps</td></tr></table>
`+r([`Session`,`matches rule`,`Manual`,`first usable member`,`Best Quality`,`best measured metric`,`Member A`,`alive`,`Member B`,`alive, better`,`Chosen`,`one member`,`Manual ignores quality; Best Quality compares it.`])+`
<h3>Reference configuration</h3>
<pre class="code"># Try it: lab "Best quality for voice, a pinned link for backups"
config system sdwan
    config service
        edit 2
            set name "Voice-best-quality"
            set mode priority
            set dst "HQ-VOIP-NET"
            set health-check "HQ-Loopback"
            set link-cost-factor latency
            set priority-members 1 2
        next
        edit 3
            set name "Backup-pinned"
            set mode manual
            set dst "BACKUP-SERVER"
            set priority-members 2
        next
    end
end</pre>
<p>I am confident in <code>mode</code>, <code>health-check</code>, <code>link-cost-factor</code> and <code>priority-members</code> as service options. Ask <code>set link-cost-factor ?</code> to see the exact metric names offered by your firmware.</p>
<h3>Worked example: why jitter is a better factor for voice</h3>
<p>Two members to HQ: MPLS has 40 ms latency and 1 ms jitter; broadband has 30 ms latency and 25 ms jitter. A latency-based rule picks broadband, which sounds better on paper but causes choppy voice because the jitter buffer overflows. A jitter-based rule picks MPLS. For voice, choose jitter or put SLA targets on the voice rule (chapter 4); for bulk downloads, bandwidth matters more.</p>
<div class="warn"><p><b>Common mistake.</b> Using manual mode and expecting automatic failover on poor quality. Manual only reacts to the member being down or dead. If you need quality-based failover, use best quality or lowest cost with SLA targets.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which strategy requires a health check to be meaningful?" Best Quality and Lowest Cost. Manual works without one but gains dead-link detection when you attach a health check.</p></div>
<div class="scn"><h4>Flapping voice</h4><p>A branch had a best-quality voice rule on latency with two links that differed by about 2 ms. Calls kept moving between links every few seconds and users heard clicks. The fix was a hold-down time and a different metric. After that the rule stayed on one link until a real degradation.</p><p><b>Lesson:</b> Best quality needs stability controls; do not let a tiny difference move sessions.</p></div>
<div class="iv"><p class="q">"Manual or best quality for a payment terminal that must always use the MPLS link?"</p><p>Manual pinned to MPLS, ideally with a health check so it fails to the second member only when MPLS is dead. Best quality could move it to broadband for a small gain, which may break source-address allow-lists at the payment provider.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Manual picks the first usable member; best quality picks the best measured metric.</li><li>priority-members order is a preference and a tie-breaker.</li><li>Pick the metric that fits the traffic: jitter or latency for voice, bandwidth for bulk.</li><li>Add stability controls on noisy links.</li></ul></div>
`,hi:`
<p>Zyaadatar designs mein do strategies kaam ka bojh uthati hain. <b>Manual</b> kehta hai "yeh member use karo aur kuch naapa nahi jaata". <b>Best Quality</b> (CLI <code>mode priority</code>) kehta hai "woh member use karo jo mere bataye metric par sabse acha score kare". Dono <code>priority-members</code> list par depend karte hain: un members ke sequence numbers jo use ho sakte hain, preference order mein.</p>
<h3>Manual</h3>
<p>Manual mode mein aap ek ya zyada members ka naam dete ho. Session list ka <b>pehla usable member</b> use karta hai. Member usable nahi hota jab uska interface down ho, ya, agar aapne health check lagaya hai, jab woh check use dead declare kare. Latency ya loss ki koi comparison nahi hoti. Aam uses: management flow ko MPLS member par pin karna, backup traffic ko sasti broadband par pin karna, ya legacy application ko pin karna jo source address badalne par toot jaati hai.</p>
<h3>Best Quality (priority)</h3>
<p>Yahan rule ek health check aur ek <b>link cost factor</b> lagata hai: latency, jitter, packet loss, ya bandwidth figure (incoming, outgoing ya bidirectional). Engine har listed member ki current measurement padhta hai aur sabse acha chunta hai. Jab do members paas hon, <b>priority-members list ka order</b> aur tie-break setting (chapter 6) tay karte hain. Threshold ke bina 1 ms jaisa chhota fark choice palat sakta hai, isliye noisy links par threshold ya hold-down time lagate hain taaki traffic members ke beech flap na kare.</p>
<table class="cmp"><tr><th>Sawal</th><th>Manual</th><th>Best Quality</th></tr>
<tr><td>Measurements use karta hai?</td><td>Sirf alive ya dead</td><td>Haan, chune hue metric ko compare karta hai</td></tr>
<tr><td>CLI mode value</td><td><code>manual</code></td><td><code>priority</code></td></tr>
<tr><td>Kaise chunta hai</td><td>List order</td><td>Best score, tie par list order</td></tr>
<tr><td>Kiske liye acha</td><td>Pinned flows, backup, legacy</td><td>Voice, video, interactive apps</td></tr></table>
`+r([`Session`,`rule match`,`Manual`,`pehla usable member`,`Best Quality`,`best measured metric`,`Member A`,`alive`,`Member B`,`alive, behtar`,`Chuna gaya`,`ek member`,`Manual quality ignore karta hai; Best Quality compare karta hai.`])+`
<h3>Reference configuration</h3>
<pre class="code"># Try it: lab "Voice ke liye best quality, backups ke liye pinned link"
config system sdwan
    config service
        edit 2
            set name "Voice-best-quality"
            set mode priority
            set dst "HQ-VOIP-NET"
            set health-check "HQ-Loopback"
            set link-cost-factor latency
            set priority-members 1 2
        next
        edit 3
            set name "Backup-pinned"
            set mode manual
            set dst "BACKUP-SERVER"
            set priority-members 2
        next
    end
end</pre>
<p>Mujhe <code>mode</code>, <code>health-check</code>, <code>link-cost-factor</code> aur <code>priority-members</code> service options ke roop mein pakka yaad hain. Apne firmware ke exact metric names dekhne ke liye <code>set link-cost-factor ?</code> poochho.</p>
<h3>Worked example: voice ke liye jitter behtar factor kyun</h3>
<p>HQ tak do members: MPLS ki latency 40 ms aur jitter 1 ms; broadband ki latency 30 ms aur jitter 25 ms. Latency-based rule broadband chunta hai, jo kagaz par acha lagta hai lekin voice choppy hoti hai kyunki jitter buffer overflow hota hai. Jitter-based rule MPLS chunta hai. Voice ke liye jitter chuno ya voice rule par SLA targets lagao (chapter 4); bulk downloads ke liye bandwidth zyada maayne rakhta hai.</p>
<div class="warn"><p><b>Common galti.</b> Manual mode use karke kharab quality par automatic failover ki ummeed rakhna. Manual sirf tab react karta hai jab member down ya dead ho. Quality-based failover chahiye to SLA targets ke saath best quality ya lowest cost use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaun si strategy ko meaningful hone ke liye health check chahiye?" Best Quality aur Lowest Cost. Manual bina check ke chalta hai, lekin health check lagane par dead-link detection mil jaati hai.</p></div>
<div class="scn"><h4>Flap karti voice</h4><p>Ek branch mein latency par best-quality voice rule tha aur do links mein lagbhag 2 ms ka fark tha. Calls har kuch seconds mein links ke beech jaati rahi aur users ko clicks sunai diye. Fix hold-down time aur alag metric tha. Uske baad rule asli degradation tak ek link par raha.</p><p><b>Seekh:</b> Best quality ko stability controls chahiye; chhote fark ko sessions mat hilane do.</p></div>
<div class="iv"><p class="q">"Payment terminal jo hamesha MPLS link use kare, uske liye manual ya best quality?"</p><p>MPLS par pinned manual, behtar ho agar health check ke saath, taaki woh sirf MPLS dead hone par doosre member par jaaye. Best quality chhote gain ke liye use broadband par le ja sakta hai, jo payment provider ke source-address allow-lists tod sakta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Manual pehla usable member chunta hai; best quality best measured metric.</li><li>priority-members order preference aur tie-breaker dono hai.</li><li>Traffic ke hisaab se metric chuno: voice ke liye jitter ya latency, bulk ke liye bandwidth.</li><li>Noisy links par stability controls lagao.</li></ul></div>
`}};export{i as default};