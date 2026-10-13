var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(220,e(10,80,110,60,`#bae6fd`,r[0],r[1])+e(160,80,130,60,`#bbf7d0`,r[2],r[3])+e(330,10,150,50,`#ddd6fe`,r[4],r[5])+e(330,85,150,50,`#ddd6fe`,r[6],r[7])+e(330,160,150,50,`#fecaca`,r[8],r[9])+e(520,85,110,50,`#fed7aa`,r[10],r[11])+t(120,110,160,110)+t(290,110,330,35)+t(290,110,330,110)+t(290,110,330,185)+t(480,35,520,105)+t(480,110,520,110),r[12]),i={id:`cost-loadbalance`,h:{en:`Lowest Cost (SLA) and load balancing`,hi:`Lowest Cost (SLA) aur load balancing`},body:{en:`
<p>Best quality asks "which link is best right now?". <b>Lowest Cost (SLA)</b>, CLI <code>mode sla</code>, asks a more business-minded question: "which is the <b>cheapest link that is good enough</b>?". Good enough is defined by the SLA targets from <b>fsd-sla</b>. This is the strategy that saves money: the expensive MPLS member is used only when the cheap broadband misses the target.</p>
<h3>How lowest cost chooses</h3>
<ol><li>Look at the members in <code>priority-members</code> that are alive.</li><li>Keep those that <b>meet the SLA target</b> attached to the rule (a <code>config sla</code> entry names the health check and the SLA id).</li><li>Among those, pick the one with the lowest <b>cost</b>, the per-member <code>cost</code> value; when costs are equal, list order wins.</li></ol>
<p>The per-member cost is a number you assign to express price or preference, not a measured value. An SLA is binary: the member either meets all enabled targets or does not. If you want several members to be required, <code>minimum-sla-meet-members</code> controls how many must meet the SLA before the rule treats the SLA as satisfied. What exactly happens when <b>no</b> member meets the SLA differs between releases and settings, so read the real selection from <code>diagnose sys sdwan service4</code> on your device in a test rather than assuming (chapter 8).</p>
<h3>Load balancing (formerly Maximize Bandwidth)</h3>
<p>Load balancing spreads <b>sessions</b> across members that meet the SLA, for example to use two broadband links at once. In FortiOS 7.4.1 and later it is an option on manual and lowest-cost rules (<code>set load-balance enable</code>); before that it was <code>set mode load-balance</code>. Two things to remember: balancing is <b>per session</b>, not per packet, so a single large download still uses one link; and members can be given <b>weights</b> so a faster link carries more sessions. Hash-based modes may exist for how sessions are spread, so check <code>set ?</code> for the options your build offers.</p>
<table class="cmp"><tr><th>Goal</th><th>Strategy</th><th>Why</th></tr>
<tr><td>Voice must be best</td><td>Best quality (jitter)</td><td>Quality is the only goal</td></tr>
<tr><td>SaaS at lowest price if acceptable</td><td>Lowest cost + SLA</td><td>Cheap link unless it is not good enough</td></tr>
<tr><td>Use all broadband capacity</td><td>Load balancing</td><td>Many sessions share the links</td></tr>
<tr><td>Pin by design</td><td>Manual</td><td>Predictable path</td></tr></table>
`+r([`Session`,`matches rule`,`Meets SLA?`,`filter members`,`Broadband`,`cost 10, SLA ok`,`MPLS`,`cost 50, SLA ok`,`LTE`,`cost 90, SLA fail`,`Chosen`,`broadband`,`Lowest cost among members that meet the SLA.`])+`
<h3>Reference configuration</h3>
<pre class="code"># Try it: lab "Lowest cost that meets the SLA, steering by internet service, and load balancing"
config system sdwan
    config members
        edit 1
            set interface "port1"
            set cost 10
        next
        edit 2
            set interface "port2"
            set cost 50
        next
    end
    config service
        edit 4
            set name "SaaS-cheapest-good"
            set mode sla
            set internet-service enable
            set internet-service-name "Microsoft-Office365"
            config sla
                edit "Office365-HC"
                    set id 1
                next
            end
            set priority-members 1 2
        next
    end
end</pre>
<p>The <code>cost</code> member setting and the <code>config sla</code> sub-table inside a service are standard. The exact internet-service name is an example: list the available names on your build with <code>set internet-service-name ?</code>. Chapter 5 returns to the ISDB.</p>
<h3>Worked example: cost versus quality</h3>
<p>Broadband has cost 10 and meets the SLA at 60 ms latency target; MPLS has cost 50 and 25 ms. A best-quality rule would pick MPLS (faster). A lowest-cost rule picks broadband, because 60 ms is still within the target, and MPLS carries only what you put on it. The saving is real: if SaaS is 70 percent of traffic, the MPLS circuit can be sized smaller.</p>
<div class="warn"><p><b>Common mistake.</b> Expecting load balancing to give one TCP session the sum of two links. It balances whole sessions. For one huge transfer, bandwidth stays that of a single link.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question describes "cheapest acceptable link", it is Lowest Cost (SLA) with a cost per member, not best quality. If it says "use both links at once", it is load balancing (maximize bandwidth in older wording).</p></div>
<div class="scn"><h4>The expensive circuit nobody used</h4><p>A company paid for MPLS but all rules said best quality, so almost everything used the 20 ms MPLS. After switching SaaS rules to lowest cost with a 100 ms SLA and cheap broadband at cost 10, MPLS utilisation dropped sharply and the contract could be renegotiated.</p><p><b>Lesson:</b> Choose the strategy that matches the business goal, not just the fastest link.</p></div>
<div class="iv"><p class="q">"Explain the difference between best quality and lowest cost."</p><p>Best quality chooses the best measured metric among members. Lowest cost first filters members to those that meet the SLA and then chooses the lowest assigned cost, so the cheaper link wins whenever it is good enough.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Lowest cost = cheapest member that meets the SLA; cost is an administrator value.</li><li>SLA targets come from health checks (fsd-sla) and are binary per member.</li><li>Load balancing is per session, with weights; in 7.4.1+ it is an option, not a separate mode.</li><li>Verify the no-member-meets-SLA behaviour on your build.</li></ul></div>
`,hi:`
<p>Best quality poochta hai "abhi kaun sa link sabse acha hai?". <b>Lowest Cost (SLA)</b>, CLI <code>mode sla</code>, zyada business-minded sawal poochta hai: "kaun sa <b>sabse sasta link jo kaafi acha hai</b>?". Kaafi acha hona <b>fsd-sla</b> ke SLA targets se define hota hai. Yeh woh strategy hai jo paisa bachati hai: mehnga MPLS member tabhi use hota hai jab sasti broadband target miss kare.</p>
<h3>Lowest cost kaise chunta hai</h3>
<ol><li><code>priority-members</code> ke jo members alive hain unhe dekho.</li><li>Unmein se woh rakho jo rule se jude <b>SLA target ko meet karte hain</b> (<code>config sla</code> entry health check aur SLA id ka naam deti hai).</li><li>Unmein se sabse kam <b>cost</b> wala chuno, yaani per-member <code>cost</code> value; cost barabar ho to list order jeetta hai.</li></ol>
<p>Per-member cost ek number hai jo aap price ya preference dikhane ke liye dete ho, measured value nahi. SLA binary hai: member ya to saare enabled targets meet karta hai ya nahi. Agar aap chahte ho ki kai members zaroori hon, to <code>minimum-sla-meet-members</code> control karta hai ki rule SLA ko satisfied maanne se pehle kitne members meet karein. Jab <b>koi bhi</b> member SLA meet nahi karta, tab kya hota hai woh releases aur settings ke beech alag hota hai, isliye assume karne ki jagah test mein apne device par <code>diagnose sys sdwan service4</code> se asli selection padho (chapter 8).</p>
<h3>Load balancing (pehle Maximize Bandwidth)</h3>
<p>Load balancing <b>sessions</b> ko un members mein baantta hai jo SLA meet karte hain, jaise do broadband links ek saath use karne ke liye. FortiOS 7.4.1 aur baad mein yeh manual aur lowest-cost rules par ek option hai (<code>set load-balance enable</code>); pehle yeh <code>set mode load-balance</code> tha. Do baatein yaad rakho: balancing <b>per session</b> hai, per packet nahi, isliye ek bada download phir bhi ek link use karta hai; aur members ko <b>weights</b> diye ja sakte hain taaki tez link zyada sessions le. Sessions kaise baante jaate hain uske liye hash-based modes ho sakte hain, isliye apne build ke options <code>set ?</code> se dekho.</p>
<table class="cmp"><tr><th>Goal</th><th>Strategy</th><th>Kyun</th></tr>
<tr><td>Voice sabse acha chahiye</td><td>Best quality (jitter)</td><td>Quality hi ekmaatr goal</td></tr>
<tr><td>SaaS sabse sasta agar theek ho</td><td>Lowest cost + SLA</td><td>Sasta link jab tak kaafi acha ho</td></tr>
<tr><td>Saari broadband capacity use karo</td><td>Load balancing</td><td>Bahut sessions links share karte hain</td></tr>
<tr><td>Design se pin karo</td><td>Manual</td><td>Predictable path</td></tr></table>
`+r([`Session`,`rule match`,`SLA meet?`,`members filter`,`Broadband`,`cost 10, SLA ok`,`MPLS`,`cost 50, SLA ok`,`LTE`,`cost 90, SLA fail`,`Chuna gaya`,`broadband`,`SLA meet karne wale members mein sabse kam cost.`])+`
<h3>Reference configuration</h3>
<pre class="code"># Try it: lab "SLA poora karne wala lowest cost, internet service se steering, aur load balancing"
config system sdwan
    config members
        edit 1
            set interface "port1"
            set cost 10
        next
        edit 2
            set interface "port2"
            set cost 50
        next
    end
    config service
        edit 4
            set name "SaaS-cheapest-good"
            set mode sla
            set internet-service enable
            set internet-service-name "Microsoft-Office365"
            config sla
                edit "Office365-HC"
                    set id 1
                next
            end
            set priority-members 1 2
        next
    end
end</pre>
<p>Member ki <code>cost</code> setting aur service ke andar <code>config sla</code> sub-table standard hain. Exact internet-service naam ek example hai: apne build par available names <code>set internet-service-name ?</code> se list karo. Chapter 5 ISDB par wapas aata hai.</p>
<h3>Worked example: cost versus quality</h3>
<p>Broadband ki cost 10 hai aur 60 ms latency target par SLA meet karti hai; MPLS ki cost 50 aur 25 ms hai. Best-quality rule MPLS chunega (tez). Lowest-cost rule broadband chunta hai, kyunki 60 ms abhi bhi target ke andar hai, aur MPLS sirf woh carry karta hai jo aap us par rakho. Bachat asli hai: agar SaaS 70 percent traffic hai to MPLS circuit chhota size kiya ja sakta hai.</p>
<div class="warn"><p><b>Common galti.</b> Load balancing se ek TCP session ko do links ka jod milne ki ummeed. Yeh poore sessions ko balance karta hai. Ek bade transfer ke liye bandwidth ek link jitna hi rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar sawal "sabse sasta acceptable link" batata hai to woh Lowest Cost (SLA) hai jisme per-member cost hoti hai, best quality nahi. Agar "dono links ek saath use karo" kehta hai to woh load balancing hai (purani wording mein maximize bandwidth).</p></div>
<div class="scn"><h4>Mehnga circuit jo koi use nahi karta tha</h4><p>Ek company MPLS ka paisa deti thi lekin saare rules best quality the, isliye lagbhag sab kuch 20 ms wale MPLS par chalta tha. SaaS rules ko 100 ms SLA ke saath lowest cost par badalne aur sasti broadband ko cost 10 dene ke baad MPLS utilisation tezi se gira aur contract renegotiate ho saka.</p><p><b>Seekh:</b> Business goal ke hisaab se strategy chuno, sirf sabse tez link nahi.</p></div>
<div class="iv"><p class="q">"Best quality aur lowest cost ka fark samjhao."</p><p>Best quality members mein best measured metric chunta hai. Lowest cost pehle members ko un tak filter karta hai jo SLA meet karte hain, phir sabse kam assigned cost chunta hai, isliye sasta link tab jeetta hai jab woh kaafi acha ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Lowest cost = SLA meet karne wala sabse sasta member; cost administrator ki value hai.</li><li>SLA targets health checks (fsd-sla) se aate hain aur per member binary hain.</li><li>Load balancing per session hai, weights ke saath; 7.4.1+ mein yeh option hai, alag mode nahi.</li><li>Koi member SLA meet na kare to behaviour apne build par verify karo.</li></ul></div>
`}};export{i as default};