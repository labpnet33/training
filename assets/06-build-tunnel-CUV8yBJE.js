var e={id:`build-tunnel`,h:{en:`Building the HQ to branch tunnel end to end`,hi:`HQ se branch tunnel end to end banana`},body:{en:`
<p>Now we put every piece together into one complete project: a route-based IPsec tunnel between the HQ FortiGate and the Pune branch FortiGate. Follow the same sequence on a real device or in an exam answer: plan the addressing, build phase 1, phase 2, routes, policies, then verify. All configuration here is a <b>Reference configuration (not run in the simulator)</b>.</p>

<h3>Step 0: the plan</h3>
<table class="cmp"><tr><th>Item</th><th>HQ (FGT-HQ)</th><th>Branch (FGT-BR)</th></tr>
<tr><td>Internet interface</td><td>port1, 203.0.113.10</td><td>port1, 198.51.100.10</td></tr>
<tr><td>LAN interface</td><td>port2, 10.10.0.1/24</td><td>port2, 10.20.0.1/24</td></tr>
<tr><td>Tunnel interface</td><td>to-BRANCH</td><td>to-HQ</td></tr>
<tr><td>Remote gateway</td><td>198.51.100.10</td><td>203.0.113.10</td></tr>
<tr><td>Local subnet</td><td>10.10.0.0/24</td><td>10.20.0.0/24</td></tr>
<tr><td>Remote subnet</td><td>10.20.0.0/24</td><td>10.10.0.0/24</td></tr></table>
<p>Check first that the two LANs do not overlap, that both internet interfaces are reachable from each other (ping the public addresses if the policy allows it), and that UDP 500 and 4500 are not blocked. Record the agreed security settings: IKEv2, AES-256-GCM, DH 20, PFS enabled, a long random PSK or certificates.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Build order">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="12">1 Plan</text>
<rect x="135" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="190" y="75" text-anchor="middle" class="svg-ink" font-size="12">2 Phase 1</text>
<rect x="260" y="40" width="110" height="60" rx="10" fill="#fde68a"/><text x="315" y="75" text-anchor="middle" class="svg-ink" font-size="12">3 Phase 2</text>
<rect x="385" y="40" width="110" height="60" rx="10" fill="#fed7aa"/><text x="440" y="75" text-anchor="middle" class="svg-ink" font-size="12">4 Route + policy</text>
<rect x="510" y="40" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="570" y="75" text-anchor="middle" class="svg-ink" font-size="12">5 Verify</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Do HQ and branch in parallel; the branch is the mirror image</text>
</svg><p class="cap">Five steps, repeated on both firewalls.</p></div>

<h3>Step 1: HQ phase 1 and phase 2</h3>
<pre class="code"><span class="c"># FGT-HQ</span>
config vpn ipsec phase1-interface
    edit "to-BRANCH"
        set interface "port1"
        set ike-version 2
        set peertype any
        set remote-gw 198.51.100.10
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set psksecret "Placeholder-Long-Random-Secret"
        set nattraversal enable
        set dpd on-idle
        set dpd-retryinterval 10
        set dpd-retrycount 3
    next
end
config vpn ipsec phase2-interface
    edit "to-BRANCH-p2"
        set phase1name "to-BRANCH"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
        set auto-negotiate enable
    next
end</pre>

<h3>Step 2: branch phase 1 and phase 2 (mirror)</h3>
<pre class="code"><span class="c"># FGT-BR</span>
config vpn ipsec phase1-interface
    edit "to-HQ"
        set interface "port1"
        set ike-version 2
        set peertype any
        set remote-gw 203.0.113.10
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set psksecret "Placeholder-Long-Random-Secret"
        set nattraversal enable
        set dpd on-idle
        set dpd-retryinterval 10
        set dpd-retrycount 3
    next
end
config vpn ipsec phase2-interface
    edit "to-HQ-p2"
        set phase1name "to-HQ"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
        set auto-negotiate enable
    next
end</pre>
<p>Compare the two blocks line by line: only the names and <code>remote-gw</code> differ. The PSK placeholder must be replaced with the same real secret on both devices, entered securely.</p>

<h3>Step 3: routes and policies</h3>
<p>Use the HQ block from the previous chapter (static route to 10.20.0.0/24 through <code>to-BRANCH</code>, a blackhole route with distance 254, policies 20 and 21). On the branch, create the equivalent for 10.10.0.0/24 through <code>to-HQ</code>, with address objects <code>BRANCH-LAN</code> and <code>HQ-LAN</code> and one policy in each direction between <code>port2</code> and <code>to-HQ</code>, with NAT disabled.</p>

<h3>Step 4: bring it up and prove it</h3>
<ol>
<li>Check the tunnel status on both devices (next chapter lists the commands).</li>
<li>Start a ping from a host in 10.10.0.0/24 to a host in 10.20.0.0/24. On the firewall you can also use <code>execute ping-options source 10.10.0.1</code> followed by <code>execute ping 10.20.0.1</code> to test from the LAN address.</li>
<li>Check that the policy hit counters and logs show the traffic in both directions.</li>
<li>Test the failure case: disconnect the internet link at one side, confirm DPD notices, restore it and confirm the tunnel comes back without manual action.</li>
<li>Document the final settings, the peer contact and the test results.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> The engineer builds the HQ side first and brings the tunnel interface up with <code>auto-negotiate</code>. Nothing happens because the branch is not ready. Once the branch block is pasted, phase 1 and phase 2 come up within seconds. Pings from HQ succeed. A ping from the branch fails until policy 21 is added, which the engineer finds from the policy hit counter showing zero on the return policy.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Copying the HQ block to the branch without swapping <code>remote-gw</code>. Typing the PSK differently on each side. Building the tunnel before checking for overlapping subnets. Skipping the failure test and finding out about DPD during a real outage.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question may show a complete configuration for both ends and ask why the tunnel does not come up. Compare them: look for a changed proposal, DH group, PSK, mismatched selectors or a wrong <code>remote-gw</code>, in that order.</p></div>

<div class="scn"><h4>The copy-paste that pointed to itself</h4><p>An engineer cloned the HQ configuration to the branch and forgot to change <code>remote-gw</code>, so the branch tried to connect to its own public address. The logs showed IKE packets leaving and nothing returning. Reading the configuration against the plan table showed the mistake immediately.</p><p><b>Lesson:</b> always compare the finished configuration against the plan, line by line.</p></div>

<div class="iv"><p class="q">"Walk me through building a FortiGate site-to-site tunnel."</p><p>I plan the addressing and security settings, configure phase 1 with the remote gateway, IKE version, proposal, DH group and credential, then phase 2 with a matching proposal, PFS and selectors, then a static route into the tunnel interface, a blackhole route and policies in both directions. I repeat as a mirror on the peer, verify with the IKE and tunnel commands, and test failure and recovery.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan first: addressing, non-overlapping subnets, and agreed security settings.</li>
<li>Branch configuration is the mirror image of HQ.</li>
<li>Routes and policies in both directions are part of the build.</li>
<li>Test the tunnel and the failure case before handover.</li>
<li>Replace every placeholder secret with a strong, securely shared value.</li>
</ul></div>
`,hi:`
<p>Ab hum har piece ko ek complete project mein jodte hain: HQ FortiGate aur Pune branch FortiGate ke beech route-based IPsec tunnel. Asli device par ya exam answer mein wahi sequence follow karo: addressing plan karo, phase 1, phase 2, routes, policies banao, phir verify karo. Yahan ki saari configuration <b>Reference configuration (not run in the simulator)</b> hai.</p>

<h3>Step 0: plan</h3>
<table class="cmp"><tr><th>Item</th><th>HQ (FGT-HQ)</th><th>Branch (FGT-BR)</th></tr>
<tr><td>Internet interface</td><td>port1, 203.0.113.10</td><td>port1, 198.51.100.10</td></tr>
<tr><td>LAN interface</td><td>port2, 10.10.0.1/24</td><td>port2, 10.20.0.1/24</td></tr>
<tr><td>Tunnel interface</td><td>to-BRANCH</td><td>to-HQ</td></tr>
<tr><td>Remote gateway</td><td>198.51.100.10</td><td>203.0.113.10</td></tr>
<tr><td>Local subnet</td><td>10.10.0.0/24</td><td>10.20.0.0/24</td></tr>
<tr><td>Remote subnet</td><td>10.20.0.0/24</td><td>10.10.0.0/24</td></tr></table>
<p>Pehle check karo ki dono LANs overlap nahi karte, dono internet interfaces ek-doosre se reachable hain (policy allow kare to public addresses ko ping karo), aur UDP 500 aur 4500 block nahi hain. Agreed security settings note karo: IKEv2, AES-256-GCM, DH 20, PFS enabled, lambi random PSK ya certificates.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Build order">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="12">1 Plan</text>
<rect x="135" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="190" y="75" text-anchor="middle" class="svg-ink" font-size="12">2 Phase 1</text>
<rect x="260" y="40" width="110" height="60" rx="10" fill="#fde68a"/><text x="315" y="75" text-anchor="middle" class="svg-ink" font-size="12">3 Phase 2</text>
<rect x="385" y="40" width="110" height="60" rx="10" fill="#fed7aa"/><text x="440" y="75" text-anchor="middle" class="svg-ink" font-size="12">4 Route + policy</text>
<rect x="510" y="40" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="570" y="75" text-anchor="middle" class="svg-ink" font-size="12">5 Verify</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">HQ aur branch parallel mein karo; branch mirror image hai</text>
</svg><p class="cap">Paanch steps, dono firewalls par dohraye jaate hain.</p></div>

<h3>Step 1: HQ phase 1 aur phase 2</h3>
<pre class="code"><span class="c"># FGT-HQ</span>
config vpn ipsec phase1-interface
    edit "to-BRANCH"
        set interface "port1"
        set ike-version 2
        set peertype any
        set remote-gw 198.51.100.10
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set psksecret "Placeholder-Long-Random-Secret"
        set nattraversal enable
        set dpd on-idle
        set dpd-retryinterval 10
        set dpd-retrycount 3
    next
end
config vpn ipsec phase2-interface
    edit "to-BRANCH-p2"
        set phase1name "to-BRANCH"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
        set auto-negotiate enable
    next
end</pre>

<h3>Step 2: branch phase 1 aur phase 2 (mirror)</h3>
<pre class="code"><span class="c"># FGT-BR</span>
config vpn ipsec phase1-interface
    edit "to-HQ"
        set interface "port1"
        set ike-version 2
        set peertype any
        set remote-gw 203.0.113.10
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set psksecret "Placeholder-Long-Random-Secret"
        set nattraversal enable
        set dpd on-idle
        set dpd-retryinterval 10
        set dpd-retrycount 3
    next
end
config vpn ipsec phase2-interface
    edit "to-HQ-p2"
        set phase1name "to-HQ"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
        set auto-negotiate enable
    next
end</pre>
<p>Dono blocks ko line by line compare karo: sirf names aur <code>remote-gw</code> alag hain. PSK placeholder ko dono devices par same asli secret se badlo, securely enter karke.</p>

<h3>Step 3: routes aur policies</h3>
<p>Pichle chapter ka HQ block use karo (<code>to-BRANCH</code> ke through 10.20.0.0/24 ka static route, distance 254 ka blackhole route, policies 20 aur 21). Branch par <code>to-HQ</code> ke through 10.10.0.0/24 ka equivalent banao, address objects <code>BRANCH-LAN</code> aur <code>HQ-LAN</code> ke saath aur <code>port2</code> aur <code>to-HQ</code> ke beech har direction mein ek policy, NAT disabled ke saath.</p>

<h3>Step 4: up karo aur prove karo</h3>
<ol>
<li>Dono devices par tunnel status check karo (agla chapter commands list karta hai).</li>
<li>10.10.0.0/24 ke host se 10.20.0.0/24 ke host ko ping shuru karo. Firewall par LAN address se test karne ke liye <code>execute ping-options source 10.10.0.1</code> ke baad <code>execute ping 10.20.0.1</code> bhi use kar sakte ho.</li>
<li>Check karo ki policy hit counters aur logs dono directions mein traffic dikhate hain.</li>
<li>Failure case test karo: ek side par internet link nikaalo, confirm karo ki DPD notice karta hai, wapas lagao aur confirm karo ki tunnel bina manual action ke wapas aata hai.</li>
<li>Final settings, peer contact aur test results document karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Engineer pehle HQ side banata hai aur <code>auto-negotiate</code> se tunnel interface up karta hai. Kuch nahi hota kyunki branch ready nahi hai. Branch block paste hote hi phase 1 aur phase 2 kuch seconds mein up ho jaate hain. HQ se pings succeed hote hain. Branch se ping tab tak fail rehta hai jab tak policy 21 add nahi hoti, jo engineer ko return policy ke zero policy hit counter se pata chalta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> HQ block ko branch par bina <code>remote-gw</code> badle copy karna. Har side par PSK alag type karna. Overlapping subnets check kiye bina tunnel banana. Failure test chhod dena aur DPD ke baare mein asli outage ke dauran pata chalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question dono ends ki complete configuration dikhakar poochh sakta hai ki tunnel up kyun nahi hota. Unhe compare karo: badla hua proposal, DH group, PSK, mismatched selectors ya galat <code>remote-gw</code>, isi kram mein dhoondho.</p></div>

<div class="scn"><h4>Copy-paste jo khud ko point karta tha</h4><p>Ek engineer ne HQ configuration ko branch par clone kiya aur <code>remote-gw</code> badalna bhool gaya, isliye branch apne hi public address se connect karne ki koshish karta raha. Logs mein IKE packets jaate dikhe aur kuch wapas nahi aaya. Configuration ko plan table se padhne par galti turant dikh gayi.</p><p><b>Lesson:</b> finished configuration ko hamesha plan se line by line compare karo.</p></div>

<div class="iv"><p class="q">"FortiGate site-to-site tunnel banane ka process samjhao."</p><p>Main addressing aur security settings plan karta hoon, phase 1 remote gateway, IKE version, proposal, DH group aur credential ke saath configure karta hoon, phir phase 2 matching proposal, PFS aur selectors ke saath, phir tunnel interface ka static route, blackhole route aur dono directions ki policies. Peer par mirror dohrata hoon, IKE aur tunnel commands se verify karta hoon, aur failure aur recovery test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle plan: addressing, non-overlapping subnets aur agreed security settings.</li>
<li>Branch configuration HQ ki mirror image hai.</li>
<li>Dono directions ke routes aur policies build ka hissa hain.</li>
<li>Handover se pehle tunnel aur failure case test karo.</li>
<li>Har placeholder secret ko strong, securely shared value se badlo.</li>
</ul></div>
`}};export{e as default};