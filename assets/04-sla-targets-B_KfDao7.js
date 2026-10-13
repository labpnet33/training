var e=(e,t,n,r,i,a,o)=>`<text x="10" y="`+(e+14)+`" class="svg-ink" font-size="12">`+t+`</text><rect x="130" y="`+e+`" width="360" height="20" rx="4" fill="#e2e8f0"/><rect x="130" y="`+e+`" width="`+360*n/r+`" height="20" rx="4" fill="`+(a?`#bbf7d0`:`#fecaca`)+`"/><line x1="`+(130+360*i/r)+`" y1="`+(e-4)+`" x2="`+(130+360*i/r)+`" y2="`+(e+24)+`" stroke="#475569" stroke-width="3"/><text x="500" y="`+(e+14)+`" class="svg-muted" font-size="12">`+o+`</text>`,t=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,n=n=>t(175,e(15,n[0],90,200,150,!0,`90 of 150`)+e(55,n[1],35,60,30,!1,`35 of 30`)+e(95,n[2],.4,2,1,!0,`0.4 of 1`)+`<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">`+n[3]+`</text>`,n[4]),r=`<pre class="code">! Reference configuration (not run in the simulator)
config system sdwan
    config health-check
        edit "HUB-PING"
            set server "10.255.0.1"
            set protocol ping
            set members 1 2
            set sla-fail-log-period 10
            set sla-pass-log-period 300
            config sla
                edit 1
                    set link-cost-factor latency jitter packet-loss
                    set latency-threshold 150
                    set jitter-threshold 30
                    set packetloss-threshold 1
                next
                edit 2
                    set link-cost-factor latency
                    set latency-threshold 250
                    set jitter-threshold 100
                    set packetloss-threshold 5
                next
            end
        next
    end
end</pre>`,i={id:`sla-targets`,h:{en:`SLA targets: thresholds, link-cost-factor, logging and tuning for voice, video and SaaS`,hi:`SLA targets: thresholds, link-cost-factor, logging aur voice, video, SaaS ke liye tuning`},body:{en:`
<p>The probes give raw numbers. The <b>SLA target</b> turns them into a verdict: pass or fail. You met the idea in <b>nse4-sdwan</b>. Now we use it the way an architect does: several targets in one health check, numbers derived from the application, logs for evidence, and care with the defaults. Think of an exam: the marks are the measurement, the pass mark is the SLA, and different courses have different pass marks.</p>
<h3>Several targets in one health check</h3>
<p>Inside a health check, <code>config sla</code> can hold many numbered entries (SLA ids). Each is a separate pass mark. A strict one for voice and a relaxed one for web can share the same probes. A rule then names the health check and the SLA id it needs. The member's current result is kept as a <b>SLA map</b>, a bit for each target: bit 1 means SLA 1 is met, bit 2 means SLA 2 is met. A map of <code>0x1</code> means only SLA 1 passes; <code>0x3</code> means both.</p>
`+r+`
`+n([`latency (ms)`,`jitter (ms)`,`loss (%)`,`SLA 1 fails: jitter 35 is above 30`,`A member meets a target only if all of its thresholds pass. The dark mark is the threshold.`])+`
<h3>The three thresholds</h3>
<table class="cmp"><tr><th>CLI</th><th>Unit</th><th>Meaning</th></tr>
<tr><td><code>latency-threshold</code></td><td>ms</td><td>The measured latency must not exceed it.</td></tr>
<tr><td><code>jitter-threshold</code></td><td>ms</td><td>Variation in delay must not exceed it.</td></tr>
<tr><td><code>packetloss-threshold</code></td><td>percent</td><td>Lost probes as a percentage must not exceed it.</td></tr></table>
<p>All set thresholds must hold at the same time. Recent releases also let you define a <b>mean opinion score (MOS)</b> based target for voice, where the FortiGate estimates call quality from latency, jitter and loss for a chosen codec. Use <code>set ?</code> inside <code>config sla</code> to see which options your firmware offers. <b>Always set the thresholds yourself:</b> the default values of an unset target are very small, so a new SLA with no numbers can make every link look out of SLA.</p>
<h3>link-cost-factor</h3>
<p><code>link-cost-factor</code> names which measurements are used when a rule must rank members, for example latency and jitter and packet-loss, or bandwidth values. It is used by the <b>Best Quality</b> strategy and the SLA-based strategies for tie-breaking, which you will use in <b>fsd-rules</b>. Listing several factors combines them. Keep the list short and relevant: voice cares about latency, jitter and loss; a backup job cares about bandwidth.</p>
<h3>Logging SLA changes</h3>
<p>Two settings write periodic event logs. <code>sla-fail-log-period</code> writes a log every N seconds while a member fails its SLA. <code>sla-pass-log-period</code> does the same while it passes. A value of 0 disables the log. The values above (fail every 10 s, pass every 300 s) give dense evidence during a problem and a light heartbeat otherwise. In the GUI look for the SD-WAN events under <b>Log &amp; Report</b>; the exact page name varies with the release. If logs go to FortiAnalyzer, SLA history can be reported there.</p>
<h3>Starting values for real traffic</h3>
<table class="cmp"><tr><th>Traffic</th><th>latency</th><th>jitter</th><th>loss</th><th>Why</th></tr>
<tr><td>Voice (SIP, RTP)</td><td>150 ms or less</td><td>30 ms</td><td>1 percent</td><td>ITU guidance is about 150 ms one way; loss above 1 percent is audible.</td></tr>
<tr><td>Video conferencing</td><td>150 ms</td><td>30 ms</td><td>1 percent</td><td>Similar to voice, but sensitive to bursts of loss.</td></tr>
<tr><td>Interactive SaaS, ERP</td><td>200 to 250 ms</td><td>50 to 100 ms</td><td>2 to 3 percent</td><td>Users notice slowness, but short outages are tolerated.</td></tr>
<tr><td>Bulk, backups, updates</td><td>No SLA, or 500 ms</td><td>none</td><td>5 percent</td><td>Throughput matters more; use cost and bandwidth strategies.</td></tr></table>
<p>These are <b>starting points</b>. Probes measure a round trip, so if you reason in one-way budgets, remember the probe sees roughly twice. Tune with data: let the health check run for a week in monitoring only (no rule), read the typical and the worst values per hour, and set thresholds just above normal.</p>
<div class="eg"><p><b>Worked example: why loss matters for bulk too.</b> A TCP flow's throughput is limited by roughly MSS / (RTT x square root of loss). With an MSS of 1,460 bytes (11,680 bits), an RTT of 50 ms and 1 percent loss, that is 11,680 / (0.05 x 0.1), about 2.3 Mbit/s per flow, even on a 100 Mbit link. With 0.1 percent loss it is about 7.4 Mbit/s. A link with persistent 1 percent loss can be "up" and "fast" yet crawl, so a loose loss threshold of 5 percent on bulk is not a licence to ignore it.</p></div>
<div class="warn"><p><b>Common mistake.</b> Copying thresholds from a blog. Latency that is normal between Mumbai and Frankfurt (120 ms) is a failure between two offices in Pune. Base thresholds on measured normal values and on the application's need.</p></div>
<div class="exam"><p><b>Exam trap.</b> All thresholds of one SLA target must pass together. The SLA map shows which targets pass. A member can meet SLA 2 but not SLA 1. The health check is not the same as the SLA id.</p></div>
<div class="scn"><h4>The target nobody set</h4><p>An engineer added an SLA to a health check for a voice rule but typed only the packet-loss value. The other thresholds stayed at the very small defaults, so both links looked out of SLA permanently, the rule found no eligible member, and voice fell back to default routing. Setting all three thresholds explicitly fixed it, and the team added a template check that rejects SLA targets with a missing threshold.</p><p><b>Lesson:</b> Always set all thresholds explicitly; a half-written target fails everything.</p></div>
<div class="iv"><p class="q">"How would you decide the SLA numbers for a voice rule?"</p><p>Start from the application: about 150 ms, 30 ms jitter and 1 percent loss. Then check the real baseline of the links with a monitoring-only health check for a week, and set thresholds just above normal so that real degradation fails the SLA but normal variation does not. Add sla-fail-log-period for evidence.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>One health check can hold many SLA targets; the SLA map shows which pass.</li><li>Thresholds: latency, jitter, packet loss; all must pass together; always set them explicitly.</li><li>link-cost-factor chooses what to compare when ranking members.</li><li>sla-fail-log-period and sla-pass-log-period write evidence logs; 0 disables.</li><li>Starting values: voice 150/30/1, SaaS 250/100/3; tune from a week of data.</li></ul></div>
`,hi:`
<p>Probes raw numbers dete hain. <b>SLA target</b> unhe verdict banata hai: pass ya fail. Aap isse <b>nse4-sdwan</b> mein mile the. Ab hum ise architect ki tarah use karte hain: ek health check mein kai targets, application se nikle numbers, saboot ke liye logs, aur defaults ke saath saavdhaani. Exam socho: marks measurement hain, pass mark SLA hai, aur alag courses ke pass marks alag hote hain.</p>
<h3>Ek health check mein kai targets</h3>
<p>Health check ke andar <code>config sla</code> kai numbered entries (SLA ids) rakh sakta hai. Har ek alag pass mark hai. Voice ka strict aur web ka relaxed ek hi probes share kar sakte hain. Rule phir health check aur woh SLA id naam se leta hai jo use chahiye. Member ka current result ek <b>SLA map</b> mein rehta hai, har target ke liye ek bit: bit 1 matlab SLA 1 meet hai, bit 2 matlab SLA 2 meet hai. <code>0x1</code> map ka matlab sirf SLA 1 pass hai; <code>0x3</code> matlab dono.</p>
`+r+`
`+n([`latency (ms)`,`jitter (ms)`,`loss (%)`,`SLA 1 fail: jitter 35, 30 se upar`,`Member target tabhi meet karta hai jab uske saare thresholds pass hon. Gehra nishaan threshold hai.`])+`
<h3>Teen thresholds</h3>
<table class="cmp"><tr><th>CLI</th><th>Unit</th><th>Matlab</th></tr>
<tr><td><code>latency-threshold</code></td><td>ms</td><td>Naapi gayi latency isse zyada nahi honi chahiye.</td></tr>
<tr><td><code>jitter-threshold</code></td><td>ms</td><td>Delay ka utaar-chadhaav isse zyada nahi hona chahiye.</td></tr>
<tr><td><code>packetloss-threshold</code></td><td>percent</td><td>Lost probes ka percentage isse zyada nahi hona chahiye.</td></tr></table>
<p>Set kiye gaye saare thresholds ek saath hold hone chahiye. Recent releases voice ke liye <b>mean opinion score (MOS)</b> based target bhi dene dete hain, jahan FortiGate chune hue codec ke liye latency, jitter aur loss se call quality estimate karta hai. Apne firmware ke options dekhne ke liye <code>config sla</code> ke andar <code>set ?</code> use karo. <b>Thresholds hamesha khud set karo:</b> unset target ke default values bahut chhote hote hain, isliye bina numbers wala naya SLA har link ko out of SLA dikha sakta hai.</p>
<h3>link-cost-factor</h3>
<p><code>link-cost-factor</code> batata hai ki jab rule ko members rank karne ho to kaun se measurements use hon, jaise latency aur jitter aur packet-loss, ya bandwidth values. Yeh <b>Best Quality</b> strategy aur SLA-based strategies ke tie-breaking mein use hota hai, jo aap <b>fsd-rules</b> mein use karoge. Kai factors list karne se woh combine hote hain. List chhoti aur relevant rakho: voice ko latency, jitter aur loss ki parwaah hai; backup job ko bandwidth ki.</p>
<h3>SLA changes ko log karna</h3>
<p>Do settings periodic event logs likhti hain. <code>sla-fail-log-period</code> har N seconds log likhta hai jab tak member SLA fail kar raha ho. <code>sla-pass-log-period</code> wahi karta hai jab tak woh pass kar raha ho. 0 value log disable karti hai. Upar ki values (fail par har 10 s, pass par har 300 s) problem ke dauran ghana saboot aur baaki samay halka heartbeat deti hain. GUI mein <b>Log &amp; Report</b> ke andar SD-WAN events dekho; page ka exact naam release ke saath badalta hai. Logs FortiAnalyzer ko jaate hon to SLA history wahan report ho sakti hai.</p>
<h3>Real traffic ke liye starting values</h3>
<table class="cmp"><tr><th>Traffic</th><th>latency</th><th>jitter</th><th>loss</th><th>Kyun</th></tr>
<tr><td>Voice (SIP, RTP)</td><td>150 ms ya kam</td><td>30 ms</td><td>1 percent</td><td>ITU guidance lagbhag 150 ms one way hai; 1 percent se upar loss sunai deta hai.</td></tr>
<tr><td>Video conferencing</td><td>150 ms</td><td>30 ms</td><td>1 percent</td><td>Voice jaisa, par loss ke bursts ke liye sensitive.</td></tr>
<tr><td>Interactive SaaS, ERP</td><td>200 se 250 ms</td><td>50 se 100 ms</td><td>2 se 3 percent</td><td>Users ko slowness dikhti hai, par chhote outages sahe jaate hain.</td></tr>
<tr><td>Bulk, backups, updates</td><td>SLA nahi, ya 500 ms</td><td>koi nahi</td><td>5 percent</td><td>Throughput zyada maayne rakhta hai; cost aur bandwidth strategies use karo.</td></tr></table>
<p>Yeh <b>starting points</b> hain. Probes round trip naapte hain, isliye agar aap one-way budgets mein sochte ho to yaad rakho probe lagbhag double dekhta hai. Data se tune karo: health check ko ek hafte tak sirf monitoring mein (bina rule ke) chalne do, har ghante ke typical aur worst values padho, aur thresholds normal ke thoda upar set karo.</p>
<div class="eg"><p><b>Worked example: bulk ke liye bhi loss kyun maayne rakhta hai.</b> TCP flow ka throughput lagbhag MSS / (RTT x loss ka square root) se seemit hota hai. MSS 1,460 bytes (11,680 bits), RTT 50 ms aur 1 percent loss ke saath yeh 11,680 / (0.05 x 0.1), lagbhag 2.3 Mbit/s per flow hai, 100 Mbit link par bhi. 0.1 percent loss ke saath lagbhag 7.4 Mbit/s. Jis link par lagataar 1 percent loss ho woh "up" aur "fast" hote hue bhi renge, isliye bulk par 5 percent ka dheela loss threshold ise nazarandaz karne ka license nahi hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Blog se thresholds copy karna. Mumbai aur Frankfurt ke beech normal latency (120 ms) Pune ke do offices ke beech failure hai. Thresholds naape gaye normal values aur application ki zaroorat par rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek SLA target ke saare thresholds saath mein pass hone chahiye. SLA map dikhata hai kaun se targets pass hain. Member SLA 2 meet kar sakta hai par SLA 1 nahi. Health check aur SLA id ek nahi hain.</p></div>
<div class="scn"><h4>Woh target jo kisi ne set nahi kiya</h4><p>Ek engineer ne voice rule ke liye health check mein SLA jodha par sirf packet-loss value type ki. Baaki thresholds bahut chhote defaults par rahe, isliye dono links hamesha out of SLA dikhi, rule ko koi eligible member nahi mila, aur voice default routing par gir gayi. Teeno thresholds explicitly set karne se theek hua, aur team ne template check jodha jo missing threshold wale SLA targets reject karta hai.</p><p><b>Seekh:</b> Saare thresholds hamesha explicitly set karo; aadha likha target sab kuch fail kar deta hai.</p></div>
<div class="iv"><p class="q">"Voice rule ke liye SLA numbers kaise tay karoge?"</p><p>Application se shuru: lagbhag 150 ms, 30 ms jitter aur 1 percent loss. Phir ek hafte ke monitoring-only health check se links ki asli baseline dekho, aur thresholds normal ke thoda upar set karo taaki asli degradation SLA fail kare par normal variation nahi. Saboot ke liye sla-fail-log-period jodo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Ek health check kai SLA targets rakh sakta hai; SLA map dikhata hai kaun se pass hain.</li><li>Thresholds: latency, jitter, packet loss; sab saath pass hone chahiye; hamesha explicitly set karo.</li><li>link-cost-factor tay karta hai ki members rank karte waqt kya compare ho.</li><li>sla-fail-log-period aur sla-pass-log-period saboot logs likhte hain; 0 disable karta hai.</li><li>Starting values: voice 150/30/1, SaaS 250/100/3; ek hafte ke data se tune karo.</li></ul></div>
`}};export{i as default};