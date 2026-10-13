var e={id:`nso-automation`,h:{en:`NSO service automation: from intent to device configuration`,hi:`NSO service automation: intent se device configuration tak`},body:{en:`
<p><b>The problem NSO solves.</b> A customer needs a Layer 3 VPN. In a provider with five vendors that means touching a PE router, maybe a route reflector and an access device, each with different CLI. Doing this by hand is slow and error-prone, and removing the service later is worse because you must remember every line. <b>Cisco Network Services Orchestrator (NSO)</b> lets you describe the <i>service</i> once, at a high level, and NSO works out the device configuration, applies it atomically and can remove it again cleanly.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Operator / OSS</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">service request</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">NSO</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">service model + CDB</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">NED</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">device driver</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Devices</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">IOS XR, XE, others</text></svg><p class="cap">NSO turns a service request into device configuration through NEDs.</p></div>
<h3>The main building blocks</h3>
<dl class="terms"><dt>CDB</dt><dd>The configuration database inside NSO; it holds a copy of each device configuration and the service instances.</dd><dt>NED</dt><dd>Network Element Driver: translates NSO operations into what a particular device type understands (NETCONF, CLI, REST).</dd><dt>Service model</dt><dd>A YANG model that defines the inputs of a service, for example customer name, site, VRF name, interface.</dd><dt>Service mapping</dt><dd>Templates (XML) or code (Python, Java) that translate the service inputs into device configuration.</dd><dt>FASTMAP</dt><dd>The NSO algorithm that records what a service created, so changes and deletes need no hand-written undo logic.</dd></dl>
<h3>A tiny service model</h3>
<p><b>Reference configuration (not run in the simulator).</b> A sketch of a YANG service model, only to show the idea. Names are placeholders.</p>
<pre class="code"><span class="c">// Reference configuration (not run in the simulator): YANG service model sketch</span>
list l3vpn {
  key name;
  uses ncs:service-data;
  ncs:servicepoint "l3vpn-service";
  leaf name { type string; }
  leaf customer { type string; }
  leaf vrf-name { type string; }
  list site {
    key device;
    leaf device { type leafref { path "/ncs:devices/ncs:device/ncs:name"; } }
    leaf interface { type string; }
    leaf ip-address { type string; }
  }
}</pre>
<p>The service template (not shown) maps these inputs onto each device's native model. If you later change the IP address in the service instance, NSO recomputes the result and sends only the difference. If you delete the instance, FASTMAP removes exactly what the service created.</p>
<h3>The NSO workflow</h3>
<pre class="code"><span class="c">! Reference commands (not run in the simulator) - NSO CLI</span>
devices sync-from                      <span class="c">! learn current device configs into CDB</span>
devices check-sync                     <span class="c">! are devices in sync with CDB?</span>
config
 l3vpn CUST-A customer CUST-A vrf-name CUST-A-VRF
 commit dry-run                        <span class="c">! show what would be pushed, nothing sent</span>
 commit                                <span class="c">! apply to CDB and devices as one transaction</span>
 rollback-files apply-rollback-file id 0</pre>
<ul><li><b>sync-from</b> reads the device into NSO, <b>check-sync</b> tells you if someone changed a device behind NSO's back (out of sync).</li>
<li><b>commit dry-run</b> shows the exact device configuration in native format before anything is sent.</li>
<li><b>Transactions are atomic</b>: if one device fails, the whole change is rolled back, which is vital for multi-device services. A <b>commit queue</b> can apply changes asynchronously and handle slow devices.</li>
<li><b>Rollback</b> returns to an earlier commit. <b>re-deploy</b> re-applies a service after an out-of-band change.</li></ul>
<p>NSO has northbound interfaces (CLI, NETCONF, RESTCONF, web UI, Python or Java APIs) for people and for OSS or portals, and southbound interfaces (NEDs) to devices. It does not replace telemetry; it can <i>consume</i> telemetry events to trigger actions.</p>
<div class="eg"><p><b>Worked example.</b> A new customer needs VRF CUST-A on two PEs. The operator creates one l3vpn instance with two site entries. commit dry-run shows the native IOS XR configuration for both PEs. After commit, both are configured in one transaction. Deleting the instance a year later removes the VRF and interface settings from both without anyone remembering them.</p></div>
<div class="warn"><p><b>Common mistake.</b> Changing a device by CLI behind NSO's back. NSO then shows out-of-sync, and a later commit can overwrite or refuse. Use check-sync, then either sync-from (accept the device) or re-deploy (restore the service intent), but decide consciously.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the vocabulary: CDB, NED, service model, service template, FASTMAP, dry-run, commit queue, out-of-sync. NSO transactions are atomic across devices, and NSO is a service orchestrator, not a monitoring system.</p></div>
<div class="scn"><h4>The change that rolled itself back</h4><p>An engineer added a new site to an existing VPN service. NSO committed to two of three PEs, but the third rejected one command. Because the transaction was atomic, NSO rolled back all three and showed the error in commit dry-run style output. The engineer fixed the input and committed once successfully, with no half-configured VPN.</p><p><b>Lesson:</b> Atomic multi-device commits prevent partial outages.</p></div>
<div class="iv"><p class="q">"What is FASTMAP in NSO?"</p><p>FASTMAP is the algorithm NSO uses to manage service lifecycle. When a service is created, NSO runs the mapping and records the resulting device changes in the CDB. When the service is changed, NSO re-runs the mapping and computes the difference; when it is deleted, NSO removes exactly what the service created. The developer writes only the create logic, never undo logic.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>NSO describes services in YANG and maps them to device configuration with templates or code.</li>
<li>NEDs are device drivers; CDB holds device and service data.</li>
<li>Commits are atomic across devices; dry-run previews them.</li>
<li>FASTMAP handles change and delete automatically.</li>
<li>Out-of-sync devices must be reconciled consciously.</li></ul></div>
`,hi:`
<p><b>NSO kaunsi problem solve karta hai.</b> Customer ko Layer 3 VPN chahiye. Paanch vendors wale provider mein iska matlab hai PE router, shayad route reflector aur access device ko chhoona, har ek ka alag CLI. Haath se karna slow aur error-prone hai, aur baad mein service hataana aur bura hai kyunki har line yaad rakhni padti hai. <b>Cisco Network Services Orchestrator (NSO)</b> aapko <i>service</i> ek baar high level par describe karne deta hai, aur NSO device configuration nikalta hai, atomically apply karta hai aur use saaf tarike se hata bhi sakta hai.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="127" height="60" rx="10" fill="#bae6fd"/><text x="83.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Operator / OSS</text><text x="83.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">service request</text><line x1="147" y1="55" x2="177" y2="55" stroke="#64748b" stroke-width="2"/><rect x="177" y="25" width="127" height="60" rx="10" fill="#bbf7d0"/><text x="240.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">NSO</text><text x="240.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">service model + CDB</text><line x1="304" y1="55" x2="334" y2="55" stroke="#64748b" stroke-width="2"/><rect x="334" y="25" width="127" height="60" rx="10" fill="#ddd6fe"/><text x="397.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">NED</text><text x="397.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">device driver</text><line x1="461" y1="55" x2="491" y2="55" stroke="#64748b" stroke-width="2"/><rect x="491" y="25" width="127" height="60" rx="10" fill="#fde68a"/><text x="554.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Devices</text><text x="554.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">IOS XR, XE, others</text></svg><p class="cap">NSO service request ko NEDs ke zariye device configuration mein badalta hai.</p></div>
<h3>Main building blocks</h3>
<dl class="terms"><dt>CDB</dt><dd>NSO ke andar configuration database; ismein har device configuration ki copy aur service instances hote hain.</dd><dt>NED</dt><dd>Network Element Driver: NSO operations ko us cheez mein translate karta hai jo ek particular device type samajhta hai (NETCONF, CLI, REST).</dd><dt>Service model</dt><dd>YANG model jo service ke inputs define karta hai, jaise customer name, site, VRF name, interface.</dd><dt>Service mapping</dt><dd>Templates (XML) ya code (Python, Java) jo service inputs ko device configuration mein translate karte hain.</dd><dt>FASTMAP</dt><dd>NSO ka algorithm jo record karta hai ki service ne kya banaya, taaki changes aur deletes ko haath se likhi undo logic na chahiye.</dd></dl>
<h3>Ek chhota service model</h3>
<p><b>Reference configuration (not run in the simulator).</b> YANG service model ka sketch, sirf idea dikhane ke liye. Naam placeholders hain.</p>
<pre class="code"><span class="c">// Reference configuration (not run in the simulator): YANG service model sketch</span>
list l3vpn {
  key name;
  uses ncs:service-data;
  ncs:servicepoint "l3vpn-service";
  leaf name { type string; }
  leaf customer { type string; }
  leaf vrf-name { type string; }
  list site {
    key device;
    leaf device { type leafref { path "/ncs:devices/ncs:device/ncs:name"; } }
    leaf interface { type string; }
    leaf ip-address { type string; }
  }
}</pre>
<p>Service template (yahan nahi dikhaya) in inputs ko har device ke native model par map karta hai. Baad mein service instance mein IP address badlo to NSO result dobara compute karta hai aur sirf difference bhejta hai. Instance delete karo to FASTMAP theek wahi hataata hai jo service ne banaya tha.</p>
<h3>NSO workflow</h3>
<pre class="code"><span class="c">! Reference commands (not run in the simulator) - NSO CLI</span>
devices sync-from                      <span class="c">! learn current device configs into CDB</span>
devices check-sync                     <span class="c">! are devices in sync with CDB?</span>
config
 l3vpn CUST-A customer CUST-A vrf-name CUST-A-VRF
 commit dry-run                        <span class="c">! show what would be pushed, nothing sent</span>
 commit                                <span class="c">! apply to CDB and devices as one transaction</span>
 rollback-files apply-rollback-file id 0</pre>
<ul><li><b>sync-from</b> device ko NSO mein padhta hai, <b>check-sync</b> batata hai ki kisi ne NSO ke peeche device badla to nahi (out of sync).</li>
<li><b>commit dry-run</b> kuch bhejne se pehle exact device configuration native format mein dikhata hai.</li>
<li><b>Transactions atomic hain</b>: ek device fail ho to poora change rollback ho jaata hai, jo multi-device services ke liye zaroori hai. <b>Commit queue</b> changes asynchronously apply kar sakti hai aur slow devices handle karti hai.</li>
<li><b>Rollback</b> pichhle commit par wapas jaata hai. <b>re-deploy</b> out-of-band change ke baad service dobara apply karta hai.</li></ul>
<p>NSO ke northbound interfaces (CLI, NETCONF, RESTCONF, web UI, Python ya Java APIs) logon aur OSS ya portals ke liye hain, aur southbound interfaces (NEDs) devices ke liye. Yeh telemetry ko replace nahi karta; yeh actions trigger karne ke liye telemetry events <i>consume</i> kar sakta hai.</p>
<div class="eg"><p><b>Worked example.</b> Naye customer ko do PEs par VRF CUST-A chahiye. Operator do site entries wala ek l3vpn instance banata hai. commit dry-run dono PEs ke liye native IOS XR configuration dikhata hai. Commit ke baad dono ek transaction mein configured ho jaate hain. Ek saal baad instance delete karne par dono se VRF aur interface settings hat jaate hain, kisi ko yaad rakhe bina.</p></div>
<div class="warn"><p><b>Common mistake.</b> NSO ke peeche CLI se device badalna. NSO phir out-of-sync dikhata hai, aur baad ka commit overwrite kar sakta hai ya refuse. check-sync use karo, phir ya to sync-from (device accept karo) ya re-deploy (service intent restore karo), par soch samajhkar decide karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Vocabulary yaad rakho: CDB, NED, service model, service template, FASTMAP, dry-run, commit queue, out-of-sync. NSO transactions devices ke across atomic hain, aur NSO service orchestrator hai, monitoring system nahi.</p></div>
<div class="scn"><h4>Woh change jo khud rollback ho gaya</h4><p>Engineer ne maujooda VPN service mein naya site joda. NSO ne teen mein se do PEs par commit kiya, par teesre ne ek command reject kiya. Transaction atomic thi, isliye NSO ne teeno rollback kiye aur error dikhaya. Engineer ne input theek kiya aur ek baar mein successfully commit kiya, koi aadha-configured VPN nahi bacha.</p><p><b>Lesson:</b> Atomic multi-device commits partial outages rokte hain.</p></div>
<div class="iv"><p class="q">"NSO mein FASTMAP kya hai?"</p><p>FASTMAP woh algorithm hai jo NSO service lifecycle manage karne ke liye use karta hai. Service banne par NSO mapping chalata hai aur device changes ko CDB mein record karta hai. Service badalne par NSO mapping dobara chalata hai aur difference compute karta hai; delete par NSO theek wahi hataata hai jo service ne banaya tha. Developer sirf create logic likhta hai, undo logic kabhi nahi.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>NSO services ko YANG mein describe karta hai aur templates ya code se device configuration par map karta hai.</li>
<li>NEDs device drivers hain; CDB device aur service data rakhta hai.</li>
<li>Commits devices ke across atomic hain; dry-run unka preview deta hai.</li>
<li>FASTMAP change aur delete automatically handle karta hai.</li>
<li>Out-of-sync devices ko soch samajhkar reconcile karna hota hai.</li></ul></div>
`}};export{e as default};