/* Arabic number agreement for the video counts (the Showcase's live-region text and its "show more" button). Arabic nouns after a number take different forms:
   1 فيديو · 2 فيديوهان · 3-10 فيديوهات (plural) · 11+ فيديو (singular). The adjective «إضافي» agrees in the same way. Never hard-code "فيديوهات" after every number. */
export const arVideos = (n) => (n === 1 ? 'فيديو واحد' : n === 2 ? 'فيديوهان' : n >= 3 && n <= 10 ? `${n} فيديوهات` : `${n} فيديو`)
/** «عرض 9 فيديوهات إضافية» / «عرض فيديو إضافي» / «عرض فيديوهين إضافيين» / «عرض 12 فيديو إضافي» */
export const arShowMore = (n) => (n === 1 ? 'عرض فيديو إضافي' : n === 2 ? 'عرض فيديوهين إضافيين' : n >= 3 && n <= 10 ? `عرض ${n} فيديوهات إضافية` : `عرض ${n} فيديو إضافي`)
