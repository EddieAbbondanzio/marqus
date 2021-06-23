export const regex = {
    /**
     * Check if a string matches the uuid format being used.
     * @param id The id to test.
     * @returns True if the string is a v4 uuid.
     */
    isId(id: string) {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
    }
};
