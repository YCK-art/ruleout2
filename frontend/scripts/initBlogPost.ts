import { createBlogPost } from "../lib/blogService";

const firstBlogPost = {
  slug: "enteropathogenic-bacteria-diarrhea-multicat-households",
  title: "Are Enteropathogenic Bacteria Really Causing Diarrhea in Multicat Households?",
  subtitle: "A Rule-Out–Based Interpretation of a 2025 JVIM Study",
  author: "Ruleout Team",
  authorEmail: "team@ruleout.com",
  date: new Date("2025-11-17"),
  category: "Research",
  isFeatured: true,
  content: `Diarrhea is one of the most common clinical complaints in cats, and in multicat environments, it often triggers immediate concern for infectious enteropathogens. PCR fecal panels are therefore frequently ordered—sometimes reflexively—under the assumption that detecting bacteria equals diagnosing disease.

However, a 2025 prospective study published in the Journal of Veterinary Internal Medicine challenges this common assumption. The research examined 234 cats living in multicat households and found no significant association between the major "suspect" bacteria and the presence of diarrhea.

This blog post translates the study's findings into a rule-out framework, helping clinicians and educated pet owners understand what bacterial PCR can—and cannot—tell us when evaluating feline diarrhea.

⸻

## 1. Study Overview and Why It Matters

The researchers evaluated cats from 37 breeding catteries, collecting fecal samples and analyzing them via quantitative PCR for:
- Escherichia coli
- Clostridium perfringens (cpa and cpe toxin genes)
- Clostridioides difficile
- Campylobacter jejuni/coli
- Salmonella enterica

Only 9.8% of cats had diarrhea based on the Purina fecal score (≥4).
Surprisingly, none of the screened bacteria showed a statistically significant association with diarrheic feces when corrected for multiple comparisons.

This finding has major implications for diagnostic strategy in feline gastroenterology.

⸻

## 2. Rule-Out #1: "Positive PCR = Cause of Diarrhea"

### E. coli: Present in 100% of Cats

E. coli was detected in every single sample—diarrheic or not.
There was no difference in bacterial quantity between diarrheic and normal feces.

**Clinical takeaway:**
PCR detection of E. coli in feline feces has no diagnostic value for diarrhea unless supported by histopathology or strain-typing in rare infiltrative diseases.

⸻

## 3. Rule-Out #2: "Clostridium perfringens Always Causes Disease"

### cpa Gene (α-toxin)
- Present in 80.8% of all cats
- Not significantly associated with diarrhea (q = 0.10)
- Diarrheic cats had higher median copy numbers, but values overlapped extensively between groups.

This suggests that elevated cpa quantities may reflect dysbiosis, not primary infection.

### cpe Gene (enterotoxin)
- Detected in only 7.7% of cats
- Found exclusively in non-diarrheic cats in this cohort

**Clinical takeaway:**
Clostridium perfringens PCR results must be interpreted with caution.
Presence of cpa/cpe alone does not justify antimicrobial therapy.

⸻

## 4. Rule-Out #3: "Campylobacter is a Common Cause of Feline Diarrhea"

Campylobacter jejuni was found in only 4.3% of cats, and there was no association with diarrhea.

This supports previous evidence that:
- C. jejuni is often incidental in cats
- Zoonotic transmission risk remains low from healthy domestic cats
- Raw food diets may occasionally contribute to colonization

**Clinical takeaway:**
PCR-positive Campylobacter in cats—particularly in non-diarrheic animals—should not be over-interpreted.

⸻

## 5. Rule-Out #4: "Clostridioides difficile in Cats Mirrors Human CDI"

Cl. difficile was found in 2.3% of cats, all without diarrhea.
Most isolates in cats are non-toxinogenic strains, and feline CDI is rare.

**Clinical takeaway:**
A positive PCR in cats does not imply pathogenic toxin activity.
PCR-only detection is not evidence of Clostridioides difficile disease in felines.

⸻

## 6. Rule-Out #5: "Salmonella Detection Confirms Causation"

Salmonella enterica was detected in:
- 1 diarrheic cat
- 1 non-diarrheic cat

Cats—even healthy ones—can intermittently shed Salmonella, especially when fed raw meat diets.

**Clinical takeaway:**
Positive Salmonella PCR should prompt consideration of zoonotic risk and diet history, but does not automatically explain diarrhea.

⸻

## 7. Husbandry Factors: Which Ones Actually Influence Bacterial Presence?

Interestingly, some environmental variables did influence bacterial presence, though not diarrhea:
- Higher number of cats → increased cpa detection
- Raw diets → increased cpa and cpe detection
- Availability of ≥1 extra litter box → increased likelihood of cpe positivity
- Greater space per cat was paradoxically associated with higher cpa detection

These findings reinforce that bacterial detection reflects exposure and environment, not clinical disease.

⸻

## 8. What This Study Means for Clinical Practice

### ✔ Use fecal PCR cautiously

Fecal PCR is highly sensitive and may amplify DNA from harmless or non-pathogenic organisms.

### ✔ Do not prescribe antibiotics based solely on PCR results

The study emphasizes the risk of unnecessary antimicrobial use, which can:
- Disrupt the microbiome
- Promote antimicrobial resistance
- Worsen or prolong gastrointestinal disease

### ✔ Prioritize a full diagnostic work-up

True evaluation of chronic or acute diarrhea must consider:
- Dietary history
- Parasite screening
- Systemic illness
- Stress and husbandry factors
- Dysbiosis vs. infection
- Imaging and, when indicated, biopsy

### ✔ PCR may still have niche uses
- Screening fecal donors for fecal microbiota transplantation
- Assessing zoonotic risk in vulnerable households

But not as a standalone diagnostic for routine feline diarrhea.

⸻

## Conclusion

The 2025 JVIM study provides strong evidence that bacterial PCR panels should not be used as routine first-line diagnostics for feline diarrhea, especially in multicat households. Most bacteria detected are common commensals or incidental findings, not proven pathogens.

For veterinarians and informed pet owners, the most important message is:

**"Detection does not equal disease."**
A positive PCR should be interpreted in the context of clinical signs, diet, environment, and full diagnostic evaluation—not treated reflexively with antimicrobials.

⸻

## Primary Source

Bogedale K, Klein-Richers U, Felten S, et al.
Presence of Potential Enteropathogenic Bacteria in Cats and Association With Diarrhea in Multicat Households.
Journal of Veterinary Internal Medicine. 2025;39:e70138.
doi:10.1111/jvim.70138.`,
  tableOfContents: [
    { id: "study-overview", title: "Study Overview and Why It Matters" },
    { id: "rule-out-1", title: "Rule-Out #1: Positive PCR = Cause of Diarrhea" },
    { id: "rule-out-2", title: "Rule-Out #2: Clostridium perfringens Always Causes Disease" },
    { id: "rule-out-3", title: "Rule-Out #3: Campylobacter is a Common Cause" },
    { id: "rule-out-4", title: "Rule-Out #4: Clostridioides difficile in Cats" },
    { id: "rule-out-5", title: "Rule-Out #5: Salmonella Detection Confirms Causation" },
    { id: "husbandry-factors", title: "Husbandry Factors" },
    { id: "clinical-practice", title: "What This Study Means for Clinical Practice" },
    { id: "conclusion", title: "Conclusion" },
  ],
};

async function initializeBlogPost() {
  console.log("Creating first blog post...");
  const postId = await createBlogPost(firstBlogPost);

  if (postId) {
    console.log("✅ Blog post created successfully with ID:", postId);
    console.log("Slug:", firstBlogPost.slug);
  } else {
    console.error("❌ Failed to create blog post");
  }
}

// Run if executed directly
if (require.main === module) {
  initializeBlogPost()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

export { initializeBlogPost };
