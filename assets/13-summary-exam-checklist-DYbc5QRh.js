var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long trip you run through a checklist: tickets, passport, charger, keys. This chapter is your checklist for domain 3.0 of SCOR 350-701 v2.0. If you can tick every box below without looking back, you are ready for the exam questions and for the cloud security part of an interview.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">Models and responsibility</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">IAM, storage, SGs</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#fde68a"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">CSPM, CASB, frameworks</text>
<rect x="10" y="75" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="13">Multicloud Defense</text>
<rect x="220" y="75" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">Secure Workload, eBPF</text>
<rect x="430" y="75" width="200" height="50" rx="8" fill="#fed7aa"/><text x="530" y="105" text-anchor="middle" class="svg-ink" font-size="13">DevSecOps, Kubernetes</text>
<rect x="10" y="140" width="620" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Logging into Splunk with HEC, and the troubleshooting workflow</text>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>List the five NIST SP 800-145 characteristics, three service models and four deployment models.</li>
<li>Draw the shared responsibility matrix for IaaS, PaaS and SaaS and say what is always the customer's.</li>
<li>Explain implicit deny, explicit allow, explicit deny; roles vs users; why bots must not have console passwords.</li>
<li>Fix a public bucket (ACL, Block Public Access, customer-managed key) without breaking accepted public buckets.</li>
<li>Restrict SSH in a security group to an admin range; explain stateful SG vs stateless NACL; read "filtered".</li>
<li>Explain CSPM, CWPP, CIEM, CASB (inline vs API) and CNAPP; name CSA CCM/STAR, CIS, NIST CSF 2.0, ISO 27017/27018.</li>
<li>Describe Cisco Multicloud Defense (SaaS controller, auto-scaling gateways, hub or distributed, tag-based policy).</li>
<li>Describe Cisco Secure Workload: agents and connectors, ADM, policy analysis, enforcement on the workload.</li>
<li>Explain eBPF, its hook points and Cilium, Tetragon and Hypershield.</li>
<li>Place SAST, DAST, IAST, SCA/SBOM, secret, image and IaC scanning in a pipeline; describe a quality gate.</li>
<li>Name the Kubernetes controls: RBAC, namespaces, network policies, Pod Security Standards, admission, secrets, etcd.</li>
<li>Enable Splunk HEC, create a token, send events, and hunt with SPL.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Shared responsibility</dt><dd>Provider secures OF the cloud; customer secures IN the cloud.</dd>
<dt>CSPM</dt><dd>Continuous checking of cloud configuration against benchmarks.</dd>
<dt>CWPP</dt><dd>Protection of running workloads (VMs, containers, functions).</dd>
<dt>CIEM</dt><dd>Management of cloud entitlements and excess privilege.</dd>
<dt>CASB</dt><dd>Visibility, compliance, data security and threat protection for SaaS; inline or API.</dd>
<dt>CNAPP</dt><dd>Platform combining CSPM, CWPP, CIEM and pipeline scanning.</dd>
<dt>Microsegmentation</dt><dd>Allow-list policy enforced per workload to stop east-west movement.</dd>
<dt>ADM</dt><dd>Application Dependency Mapping in Secure Workload; builds policy from real flows.</dd>
<dt>eBPF</dt><dd>Verified programs running in the Linux kernel at hook points.</dd>
<dt>SBOM</dt><dd>Software bill of materials: the list of components in a release.</dd>
<dt>IaC</dt><dd>Infrastructure as code (Terraform, CloudFormation, Kubernetes YAML).</dd>
<dt>HEC</dt><dd>Splunk HTTP Event Collector; JSON over HTTPS on TCP 8088 with a token.</dd>
<dt>CIM</dt><dd>Splunk Common Information Model for vendor-neutral field names.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>PaaS: who owns the OS?</td><td>Provider</td></tr>
<tr><td>IaaS: who patches the guest OS? the hypervisor?</td><td>Customer; provider</td></tr>
<tr><td>Always the customer's in every model</td><td>Data, identities and access configuration</td></tr>
<tr><td>Deployment models</td><td>Public, private, community, hybrid</td></tr>
<tr><td>CASB mode that scans data at rest in SaaS</td><td>API (out of band)</td></tr>
<tr><td>Where Secure Workload enforces</td><td>On the workload (host firewall) or cloud security groups</td></tr>
<tr><td>Product for ingress/egress/east-west across public clouds</td><td>Multicloud Defense</td></tr>
<tr><td>Finds vulnerable open-source libraries</td><td>SCA</td></tr>
<tr><td>Tests the running app from outside</td><td>DAST</td></tr>
<tr><td>Kubernetes pod-to-pod segmentation</td><td>Network policy (default deny)</td></tr>
<tr><td>HEC port / forwarder-to-indexer port</td><td>8088 / 9997</td></tr>
<tr><td>HEC "Invalid token"</td><td>Code 4, HTTP 403</td></tr>
</table>

<h3>Lab cheat-sheet</h3>
<pre class="code"><span class="c">! Lab 1: Cloud posture triage</span>
EXT-PC&gt; curl nk-payroll-exports.storage.example/payroll-2026-09.csv
CLOUD  &gt; Findings: provider-owned = CSP-105
CLOUD  &gt; Storage &gt; nk-payroll-exports: ACL private, Block public access On, Encryption KMS
CLOUD  &gt; Security Groups &gt; sg-web: tcp/22 source 10.99.0.0/24 (keep 443 from 0.0.0.0/0)
CLOUD  &gt; IaC Scan: acl = "private", encryption { kms_key = "alias/nk-data" }, 22 from 10.99.0.0/24
EXT-PC&gt; nmap -p 22,443 52.66.10.20          <span class="c">! 22/tcp filtered</span>

<span class="c">! Lab 2: Cloud logs into Splunk with HEC</span>
SPLUNK &gt; Settings &gt; Data inputs &gt; HTTP Event Collector &gt; Global Settings: All Tokens Enabled
SPLUNK &gt; New Token: nkcloud-audit, sourcetype nkcloud:cloudtrail, index cloud
FWD&gt; forwarder set url h&#116;tps://10.50.1.20:8088
FWD&gt; forwarder set token &lt;token value&gt;
FWD&gt; forwarder start
index=cloud sourcetype=nkcloud:cloudtrail eventName=DeleteTrail          <span class="c">! dev-ci-bot</span>
index=cloud sourceIPAddress=185.220.101.7 | stats count by eventName     <span class="c">! total 4</span></pre>

<div class="eg"><p><b>Worked example: one-minute recap answer.</b> "In the posture lab, CSP-105 was the only provider finding. We made nk-payroll-exports private with Block Public Access and a customer-managed key, limited SSH on sg-web to 10.99.0.0/24, fixed three IaC checks so the pipeline passed, and verified from outside: AccessDenied and port 22 filtered. In the Splunk lab we enabled HEC on 8088, created token nkcloud-audit for index cloud, sent 6 events and found that dev-ci-bot deleted the trail; 185.220.101.7 produced 4 events."</p></div>

<div class="warn"><p><b>Last-minute mistakes.</b> Confusing CSPM with CASB, Multicloud Defense with Secure Workload, SAST with DAST, network policy with RBAC, and HEC port 8088 with 9997.</p></div>
<div class="exam"><p><b>Exam traps.</b> Read every question for the service model first; it decides the responsibility answer. If an option says the provider is responsible for your data or your IAM settings, eliminate it.</p></div>

<div class="scn"><h4>The interview that turned on one sentence</h4><p>A candidate for a cloud security role was asked, "Who is responsible for a public storage bucket in IaaS?" She answered, "The customer. The provider gives us Block Public Access and posture tools, but configuration and data are always ours. I would confirm it from outside, block public access, fix the IaC, check the audit log for who changed it and add a guardrail." The panel said that one answer covered shared responsibility, CSPM, DevSecOps and logging, and moved on to the senior questions.</p><p><b>Lesson:</b> connect the topics. Cloud security answers are strongest when posture, pipeline and logging appear together.</p></div>

<div class="iv"><p class="q">"Summarise how you would secure a new cloud workload from day one."</p><p>Guardrails first (no public storage, no admin ports to the internet, logging cannot be disabled); federated identity with MFA and roles; IaC with scanning gates in the pipeline; hardened, scanned, signed images; microsegmentation and egress control (Secure Workload, Multicloud Defense); runtime protection; CSPM for drift; audit, flow and identity logs into Splunk with alerts. Name the owner for each control using the shared responsibility model.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Responsibility first: data, identity and configuration are always yours.</li>
<li>Posture: CSPM finds, guardrails prevent, IaC fixes make it stick.</li>
<li>Workloads: Secure Workload microsegmentation, eBPF runtime security, Multicloud Defense at the network edge.</li>
<li>DevSecOps: shift left with SAST, SCA, IaC and image scanning behind a quality gate.</li>
<li>Logging: ship audit logs to Splunk via HEC (8088) before an attacker deletes them.</li>
</ul></div>
`,hi:`
<p>Lambi trip se pehle aap checklist dekhte ho: tickets, passport, charger, chaabiyan. Yeh chapter SCOR 350-701 v2.0 ke domain 3.0 ki aapki checklist hai. Agar aap neeche ka har box bina peeche dekhe tick kar sakte ho, to aap exam questions aur interview ke cloud security part ke liye ready ho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">Models aur responsibility</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">IAM, storage, SGs</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#fde68a"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">CSPM, CASB, frameworks</text>
<rect x="10" y="75" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="105" text-anchor="middle" class="svg-ink" font-size="13">Multicloud Defense</text>
<rect x="220" y="75" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">Secure Workload, eBPF</text>
<rect x="430" y="75" width="200" height="50" rx="8" fill="#fed7aa"/><text x="530" y="105" text-anchor="middle" class="svg-ink" font-size="13">DevSecOps, Kubernetes</text>
<rect x="10" y="140" width="620" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">HEC se Splunk mein logging, aur troubleshooting workflow</text>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>NIST SP 800-145 ki paanch characteristics, teen service models aur chaar deployment models list karo.</li>
<li>IaaS, PaaS aur SaaS ka shared responsibility matrix banao aur batao kya hamesha customer ka hai.</li>
<li>Implicit deny, explicit allow, explicit deny; roles vs users; bots ke console passwords kyun nahi hone chahiye, explain karo.</li>
<li>Public bucket theek karo (ACL, Block Public Access, customer-managed key) bina accepted public buckets tode.</li>
<li>Security group mein SSH ko admin range tak restrict karo; stateful SG vs stateless NACL explain karo; "filtered" padho.</li>
<li>CSPM, CWPP, CIEM, CASB (inline vs API) aur CNAPP explain karo; CSA CCM/STAR, CIS, NIST CSF 2.0, ISO 27017/27018 ka naam lo.</li>
<li>Cisco Multicloud Defense describe karo (SaaS controller, auto-scaling gateways, hub ya distributed, tag-based policy).</li>
<li>Cisco Secure Workload describe karo: agents aur connectors, ADM, policy analysis, workload par enforcement.</li>
<li>eBPF, uske hook points aur Cilium, Tetragon aur Hypershield explain karo.</li>
<li>SAST, DAST, IAST, SCA/SBOM, secret, image aur IaC scanning ko pipeline mein rakho; quality gate describe karo.</li>
<li>Kubernetes controls ka naam lo: RBAC, namespaces, network policies, Pod Security Standards, admission, secrets, etcd.</li>
<li>Splunk HEC enable karo, token banao, events bhejo, aur SPL se hunt karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Shared responsibility</dt><dd>Provider cloud KI security karta hai; customer cloud MEIN.</dd>
<dt>CSPM</dt><dd>Benchmarks ke against cloud configuration ki lagatar checking.</dd>
<dt>CWPP</dt><dd>Chalte workloads (VMs, containers, functions) ki protection.</dd>
<dt>CIEM</dt><dd>Cloud entitlements aur extra privilege ka management.</dd>
<dt>CASB</dt><dd>SaaS ke liye visibility, compliance, data security aur threat protection; inline ya API.</dd>
<dt>CNAPP</dt><dd>CSPM, CWPP, CIEM aur pipeline scanning ko jodne wala platform.</dd>
<dt>Microsegmentation</dt><dd>East-west movement rokne ke liye har workload par enforce allow-list policy.</dd>
<dt>ADM</dt><dd>Secure Workload mein Application Dependency Mapping; asli flows se policy banata hai.</dd>
<dt>eBPF</dt><dd>Linux kernel mein hook points par chalne wale verified programs.</dd>
<dt>SBOM</dt><dd>Software bill of materials: release ke components ki list.</dd>
<dt>IaC</dt><dd>Infrastructure as code (Terraform, CloudFormation, Kubernetes YAML).</dd>
<dt>HEC</dt><dd>Splunk HTTP Event Collector; token ke saath TCP 8088 par HTTPS ke upar JSON.</dd>
<dt>CIM</dt><dd>Vendor-neutral field names ke liye Splunk Common Information Model.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>PaaS: OS kiska?</td><td>Provider</td></tr>
<tr><td>IaaS: guest OS kaun patch karta hai? hypervisor?</td><td>Customer; provider</td></tr>
<tr><td>Har model mein hamesha customer ka</td><td>Data, identities aur access configuration</td></tr>
<tr><td>Deployment models</td><td>Public, private, community, hybrid</td></tr>
<tr><td>SaaS mein data at rest scan karne wala CASB mode</td><td>API (out of band)</td></tr>
<tr><td>Secure Workload kahan enforce karta hai</td><td>Workload par (host firewall) ya cloud security groups</td></tr>
<tr><td>Public clouds ke across ingress/egress/east-west ke liye product</td><td>Multicloud Defense</td></tr>
<tr><td>Vulnerable open-source libraries dhoondhta hai</td><td>SCA</td></tr>
<tr><td>Chalti app ko bahar se test karta hai</td><td>DAST</td></tr>
<tr><td>Kubernetes pod-to-pod segmentation</td><td>Network policy (default deny)</td></tr>
<tr><td>HEC port / forwarder-to-indexer port</td><td>8088 / 9997</td></tr>
<tr><td>HEC "Invalid token"</td><td>Code 4, HTTP 403</td></tr>
</table>

<h3>Lab cheat-sheet</h3>
<pre class="code"><span class="c">! Lab 1: Cloud posture triage</span>
EXT-PC&gt; curl nk-payroll-exports.storage.example/payroll-2026-09.csv
CLOUD  &gt; Findings: provider-owned = CSP-105
CLOUD  &gt; Storage &gt; nk-payroll-exports: ACL private, Block public access On, Encryption KMS
CLOUD  &gt; Security Groups &gt; sg-web: tcp/22 source 10.99.0.0/24 (443 0.0.0.0/0 se rakho)
CLOUD  &gt; IaC Scan: acl = "private", encryption { kms_key = "alias/nk-data" }, 22 from 10.99.0.0/24
EXT-PC&gt; nmap -p 22,443 52.66.10.20          <span class="c">! 22/tcp filtered</span>

<span class="c">! Lab 2: HEC se cloud logs Splunk mein</span>
SPLUNK &gt; Settings &gt; Data inputs &gt; HTTP Event Collector &gt; Global Settings: All Tokens Enabled
SPLUNK &gt; New Token: nkcloud-audit, sourcetype nkcloud:cloudtrail, index cloud
FWD&gt; forwarder set url h&#116;tps://10.50.1.20:8088
FWD&gt; forwarder set token &lt;token value&gt;
FWD&gt; forwarder start
index=cloud sourcetype=nkcloud:cloudtrail eventName=DeleteTrail          <span class="c">! dev-ci-bot</span>
index=cloud sourceIPAddress=185.220.101.7 | stats count by eventName     <span class="c">! total 4</span></pre>

<div class="eg"><p><b>Worked example: ek minute ka recap answer.</b> "Posture lab mein CSP-105 akeli provider finding thi. Humne nk-payroll-exports ko Block Public Access aur customer-managed key ke saath private kiya, sg-web par SSH ko 10.99.0.0/24 tak limit kiya, teen IaC checks theek kiye taaki pipeline pass ho, aur bahar se verify kiya: AccessDenied aur port 22 filtered. Splunk lab mein humne 8088 par HEC enable kiya, index cloud ke liye token nkcloud-audit banaya, 6 events bheje aur pata chala ki dev-ci-bot ne trail delete kiya; 185.220.101.7 se 4 events aaye."</p></div>

<div class="warn"><p><b>Last-minute galtiyan.</b> CSPM ko CASB se, Multicloud Defense ko Secure Workload se, SAST ko DAST se, network policy ko RBAC se, aur HEC port 8088 ko 9997 se confuse karna.</p></div>
<div class="exam"><p><b>Exam traps.</b> Har question mein pehle service model padho; wahi responsibility ka jawab decide karta hai. Agar koi option kahe ki aapke data ya IAM settings ki zimmedari provider ki hai, to use hata do.</p></div>

<div class="scn"><h4>Woh interview jo ek sentence par palta</h4><p>Cloud security role ke ek candidate se poocha gaya, "IaaS mein public storage bucket ki zimmedari kiski hai?" Usne jawab diya, "Customer ki. Provider hamein Block Public Access aur posture tools deta hai, lekin configuration aur data hamesha hamare hain. Main bahar se confirm karungi, public access block karungi, IaC theek karungi, audit log mein dekhungi kisne badla aur guardrail jodungi." Panel ne kaha ki us ek jawab ne shared responsibility, CSPM, DevSecOps aur logging cover kar diye, aur senior questions par aage badh gaye.</p><p><b>Seekh:</b> topics ko jodo. Cloud security answers tab sabse strong hote hain jab posture, pipeline aur logging saath aate hain.</p></div>

<div class="iv"><p class="q">"Pehle din se naya cloud workload kaise secure karoge, summarise karo."</p><p>Pehle guardrails (public storage nahi, internet ke liye admin ports nahi, logging disable nahi ho sakti); MFA aur roles ke saath federated identity; pipeline mein scanning gates ke saath IaC; hardened, scanned, signed images; microsegmentation aur egress control (Secure Workload, Multicloud Defense); runtime protection; drift ke liye CSPM; audit, flow aur identity logs alerts ke saath Splunk mein. Shared responsibility model use karke har control ka owner batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle responsibility: data, identity aur configuration hamesha aapke.</li>
<li>Posture: CSPM dhoondhta hai, guardrails rokte hain, IaC fixes use tikaate hain.</li>
<li>Workloads: Secure Workload microsegmentation, eBPF runtime security, network edge par Multicloud Defense.</li>
<li>DevSecOps: quality gate ke peeche SAST, SCA, IaC aur image scanning ke saath shift left.</li>
<li>Logging: attacker ke delete karne se pehle audit logs HEC (8088) se Splunk bhejo.</li>
</ul></div>
`}};export{e as default};