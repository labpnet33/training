var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(230,e(10,80,110,60,`#bae6fd`,r[0],r[1])+e(190,20,150,44,`#bbf7d0`,r[2],r[3])+e(190,90,150,44,`#bbf7d0`,r[4],r[5])+e(190,160,150,44,`#bbf7d0`,r[6],r[7])+e(420,20,100,44,`#ddd6fe`,r[8],r[9])+e(420,90,100,44,`#ddd6fe`,r[10],r[11])+e(420,160,100,44,`#ddd6fe`,r[12],r[13])+t(120,110,190,42)+t(120,110,190,112)+t(120,110,190,182)+t(340,42,420,42)+t(340,112,420,112)+t(340,182,420,182),r[14]),i={id:`overlay-examples`,h:{en:`Rules on overlays and three worked traffic examples`,hi:`Overlays par rules aur teen worked traffic examples`},body:{en:`
<p>In a hub-and-spoke design the members are often <b>IPsec tunnels</b> (an overlay zone) rather than physical ports. Rules treat a tunnel member exactly like any other member, but the measurements travel through the tunnel to the hub, so the health check target should be a loopback at the hub that answers inside the overlay. The underlay itself (ISP1, ISP2) is protected by the tunnels' own dead-peer detection and by separate checks; advanced IPsec comes in <b>fsd-ipsec</b>.</p>
<p>Below are three realistic rules for a branch with ISP1 (MPLS-like), ISP2 (broadband), a tunnel on each, and an HQ hub. All prefixes are documentation ranges and the names are labs. Remember the order: voice first, SaaS next, bulk last, then a catch-all.</p>
<h3>Example 1: voice to HQ (best quality, jitter)</h3>
<p>Voice cares about jitter and loss more than bandwidth. Use a best-quality rule on the overlay members with the HQ loopback health check and a jitter factor, plus SLA targets so a visibly bad link is dropped from consideration. If DSCP EF is trusted from the phones, match it with the ToS setting from chapter 2.</p>
<h3>Example 2: SaaS direct to the internet (lowest cost + SLA)</h3>
<p>Microsoft 365 or another SaaS does not need to go through HQ. Match it with ISDB, use members that are <b>underlay</b> ports (local breakout), and choose lowest cost with an SLA so cheap broadband is preferred until it is no longer good enough. Keep a second rule behind it for the same service on the overlay if you want an HQ-based fallback.</p>
<h3>Example 3: bulk backup (load balancing)</h3>
<p>Nightly backup traffic to a data-centre prefix should use all capacity and not disturb voice. Use a load-balancing rule across both overlay tunnels, with weights proportional to link speed, placed below the voice and SaaS rules.</p>
`+r([`Branch LAN`,`port3`,`Rule 1 Voice`,`best quality, jitter`,`Rule 2 SaaS`,`lowest cost + SLA`,`Rule 3 Bulk`,`load balancing`,`Overlay tunnels`,`to HQ hub`,`ISP ports`,`local breakout`,`Both tunnels`,`weighted sessions`,`Different traffic classes use different strategies on the same members.`])+`
<pre class="code"># Reference configuration (not run in the simulator)
config system sdwan
    config service
        edit 1
            set name "Voice"
            set mode priority
            set dst "HQ-VOIP-NET"
            set health-check "HQ-Loopback"
            set link-cost-factor jitter
            set priority-members 3 4
        next
        edit 2
            set name "SaaS-local-breakout"
            set mode sla
            set internet-service enable
            set internet-service-name "Microsoft-Office365"
            config sla
                edit "Office365-HC"
                    set id 1
                next
            end
            set priority-members 2 1
        next
        edit 3
            set name "Bulk-backup"
            set mode manual
            set load-balance enable
            set dst "DC-BACKUP-NET"
            set priority-members 3 4
        next
        edit 4
            set name "Catch-all"
            set mode manual
            set priority-members 3 4
        next
    end
end</pre>
<p>Here members 1 and 2 are the underlay ports (port1, port2) and 3 and 4 are the two overlay tunnels. Because rule 3 combines manual with load-balance, check on your release that <code>set load-balance enable</code> is available together with manual; Fortinet's 7.4.1 notes say it is offered with manual and lowest-cost strategies.</p>
<div class="warn"><p><b>Common mistake.</b> Putting a bulk load-balancing rule above voice, so heavy transfers and calls share the same top rule hits and nobody notices the voice rule is starved. Order protects the sensitive traffic.</p></div>
<div class="exam"><p><b>Exam trap.</b> Local breakout needs a firewall policy from the LAN to the underlay ISP interfaces with NAT; overlay traffic needs a policy to the overlay zone without NAT. A correct rule with no matching policy produces no traffic.</p></div>
<div class="scn"><h4>Voice and the nightly backup</h4><p>Calls broke every night at 01:00 when backups started. Backup shared the voice rule's link with no priority. After a dedicated bulk rule with load balancing and a voice rule above it using SLA targets, calls kept the better link even during backup.</p><p><b>Lesson:</b> Give each traffic class its own rule and order them by sensitivity.</p></div>
<div class="iv"><p class="q">"Design the rules for voice, Office 365 and backups at a branch with two ISPs and two tunnels."</p><p>Voice: best quality on jitter across the tunnels with SLA. Office 365: ISDB, lowest cost with SLA over the local ISP ports, optional overlay fallback. Backups: load balancing over both tunnels with weights. Catch-all last. Make sure policies exist and NAT only on breakout.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Tunnel members are normal members; probe a hub loopback through them.</li><li>Voice: best quality or SLA on jitter; SaaS: lowest cost with ISDB; bulk: load balancing.</li><li>Order by sensitivity, finish with an explicit catch-all.</li><li>Policies and NAT must match the chosen path.</li></ul></div>
`,hi:`
<p>Hub-and-spoke design mein members aksar physical ports ke bajaye <b>IPsec tunnels</b> (overlay zone) hote hain. Rules tunnel member ko bilkul kisi bhi member ki tarah treat karte hain, lekin measurements tunnel ke through hub tak jaate hain, isliye health check target hub ka loopback hona chahiye jo overlay ke andar jawab de. Underlay (ISP1, ISP2) ko tunnels ka apna dead-peer detection aur alag checks bachate hain; advanced IPsec <b>fsd-ipsec</b> mein aata hai.</p>
<p>Niche ek branch ke liye teen realistic rules hain jisme ISP1 (MPLS jaisa), ISP2 (broadband), har ek par tunnel, aur HQ hub hai. Saare prefixes documentation ranges hain aur naam lab ke hain. Order yaad rakho: voice pehle, SaaS phir, bulk aakhir mein, phir catch-all.</p>
<h3>Example 1: HQ ko voice (best quality, jitter)</h3>
<p>Voice ko bandwidth se zyada jitter aur loss ki parwah hai. Overlay members par best-quality rule use karo, HQ loopback health check aur jitter factor ke saath, aur SLA targets bhi taaki dikhne mein kharab link consideration se hat jaaye. Agar phones se DSCP EF par bharosa hai to chapter 2 ki ToS setting se use match karo.</p>
<h3>Example 2: SaaS seedha internet par (lowest cost + SLA)</h3>
<p>Microsoft 365 ya doosre SaaS ko HQ se guzarne ki zarurat nahi. Use ISDB se match karo, <b>underlay</b> ports wale members (local breakout) use karo, aur SLA ke saath lowest cost chuno taaki sasti broadband tab tak prefer ho jab tak woh kaafi acha na rahe. Agar HQ-based fallback chahiye to usi service ke liye overlay par uske peeche doosra rule rakho.</p>
<h3>Example 3: bulk backup (load balancing)</h3>
<p>Raat ka backup traffic data-centre prefix tak saari capacity use kare aur voice ko disturb na kare. Dono overlay tunnels par load-balancing rule use karo, link speed ke anupaat mein weights ke saath, voice aur SaaS rules ke neeche.</p>
`+r([`Branch LAN`,`port3`,`Rule 1 Voice`,`best quality, jitter`,`Rule 2 SaaS`,`lowest cost + SLA`,`Rule 3 Bulk`,`load balancing`,`Overlay tunnels`,`HQ hub tak`,`ISP ports`,`local breakout`,`Dono tunnels`,`weighted sessions`,`Alag traffic classes same members par alag strategies use karti hain.`])+`
<pre class="code"># Reference configuration (not run in the simulator)
config system sdwan
    config service
        edit 1
            set name "Voice"
            set mode priority
            set dst "HQ-VOIP-NET"
            set health-check "HQ-Loopback"
            set link-cost-factor jitter
            set priority-members 3 4
        next
        edit 2
            set name "SaaS-local-breakout"
            set mode sla
            set internet-service enable
            set internet-service-name "Microsoft-Office365"
            config sla
                edit "Office365-HC"
                    set id 1
                next
            end
            set priority-members 2 1
        next
        edit 3
            set name "Bulk-backup"
            set mode manual
            set load-balance enable
            set dst "DC-BACKUP-NET"
            set priority-members 3 4
        next
        edit 4
            set name "Catch-all"
            set mode manual
            set priority-members 3 4
        next
    end
end</pre>
<p>Yahan members 1 aur 2 underlay ports (port1, port2) hain aur 3 aur 4 do overlay tunnels. Kyunki rule 3 manual ko load-balance ke saath milata hai, apne release par check karo ki <code>set load-balance enable</code> manual ke saath available hai; Fortinet ke 7.4.1 notes kehte hain yeh manual aur lowest-cost strategies ke saath diya jaata hai.</p>
<div class="warn"><p><b>Common galti.</b> Bulk load-balancing rule ko voice ke upar rakhna, taaki heavy transfers aur calls ek hi top rule hits share karein aur kisi ko pata na chale ki voice rule bhookha hai. Order sensitive traffic ko bachata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Local breakout ke liye LAN se underlay ISP interfaces tak NAT ke saath firewall policy chahiye; overlay traffic ko overlay zone tak bina NAT ke policy chahiye. Sahi rule bina matching policy ke koi traffic nahi deta.</p></div>
<div class="scn"><h4>Voice aur raat ka backup</h4><p>Calls har raat 01:00 par toot jaati thi jab backups shuru hote. Backup voice rule ke link ko bina priority ke share karta tha. Load balancing wala alag bulk rule aur uske upar SLA targets wala voice rule lagane ke baad calls backup mein bhi behtar link par rahi.</p><p><b>Seekh:</b> Har traffic class ko apna rule do aur sensitivity se order karo.</p></div>
<div class="iv"><p class="q">"Do ISPs aur do tunnels wali branch par voice, Office 365 aur backups ke rules design karo."</p><p>Voice: tunnels par jitter par best quality SLA ke saath. Office 365: ISDB, local ISP ports par lowest cost SLA ke saath, optional overlay fallback. Backups: dono tunnels par weights ke saath load balancing. Catch-all aakhir mein. Dhyan rakho ki policies hon aur NAT sirf breakout par ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Tunnel members normal members hain; unke through hub loopback probe karo.</li><li>Voice: jitter par best quality ya SLA; SaaS: ISDB ke saath lowest cost; bulk: load balancing.</li><li>Sensitivity se order karo, explicit catch-all se khatam karo.</li><li>Policies aur NAT chune hue path se match hone chahiye.</li></ul></div>
`}};export{i as default};